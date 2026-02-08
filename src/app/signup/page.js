"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function SignupPage() {
  const router = useRouter();
  const MIN_LOADING_TIME = 3000; // 3 seconds
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpsending, setOtpsending] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [settingPin, setSettingPin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  

  const [cooldown, setCooldown] = useState(0);
  const COOLDOWN_TIME = 60;

  /* -------------------- VALIDATION -------------------- */
  const validate = () => {
    if (!displayName.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
    if (!otpVerified) return "Please verify phone number first";
    return null;
  };

  const validateBeforeOTP = () => {
    if (!displayName.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
    return null;
  };

  const validateIndianPhone = () => {
    if (!phone) return "Phone number field is empty";
    if (!/^[6-9]\d{9}$/.test(phone))
      return "Enter a valid 10-digit Indian phone number";
    return null;
  };

  /* -------------------- INIT RECAPTCHA -------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const timer = setTimeout(() => {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
        window.recaptchaVerifier.render();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);


  /* -------------------- SEND OTP -------------------- */
  const sendOTP = async () => {
    const startTime = Date.now();
    const v = validateBeforeOTP();
    if (v) return setError(v);
    setError("");
    if (phone.startsWith("+")) {
      setError("Phone number should not include country code");
      return;
    }
    
    const phoneError = validateIndianPhone();
    if (phoneError) return setError(phoneError);
    setOtpsending(true);
    
    try {
        // const elapsed = Date.now() - startTime;
        // const remaining = MIN_LOADING_TIME - elapsed;
        // if (remaining > 0) {
        //   await new Promise(res => setTimeout(res, remaining));
        // }
      await axios.post("/api/otp-request", { phone,email });

      const fullPhoneNumber = `+91${phone}`;

      
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        window.recaptchaVerifier
      );

      window.confirmationResult = confirmationResult;
      await axios.post("/api/otp-log", { phone });
      setOtpsending(false);
      setOtpSent(true);
      setCooldown(COOLDOWN_TIME);
    } catch (err) {
      setOtpsending(false);
      setError(
      err.response?.data?.error || err.message || "OTP failed"
    );

    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  /* -------------------- VERIFY OTP -------------------- */
  const verifyOTP = async () => {

    try {
      await window.confirmationResult.confirm(otp);
      
    } catch(err) {
        if (err.code === "auth/invalid-verification-code") {
          setError("Invalid OTP");
        } else if (err.code === "auth/code-expired") {
          setError("OTP expired. Please request a new one.");
        } else {
          setError("OTP verification failed");
        }
        
        throw err; // 👈 VERY IMPORTANT
    }
  };

  /* -------------------- SIGNUP -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const v = validateBeforeOTP();
    if (v) return setError(v);
    if (!window.confirmationResult) return setError("Request OTP first");

    try {
      setLoading(true);
      await verifyOTP();
      
      await axios.post("/api/signup", {
        name: displayName,
        email,
        password,
        phone,
      });
      // setSettingPin(true);
      await axios.post("/api/login", { email, password });
      router.push("/setpin");
    } catch(err) {
        
      if (err.code?.startsWith("auth/")) return;
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong. Please Refresh and try again.";
        
      setError(message);
      
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- SET PIN -------------------- */
  const handleSetPin = async (e) => {
    e.preventDefault();

    if (pin.length !== 4 || confirmPin.length !== 4)
      return setMessage("PIN must be exactly 4 digits");

    if (pin !== confirmPin)
      return setMessage("PINs do not match");

    try {
      await axios.post("/api/setpin", { email, pin });
      await axios.post("/api/login", { email, password });
      router.push("/home");
    } catch {
      setMessage("Failed to set PIN");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div id="recaptcha-container"></div>

      {!settingPin ? (
        <div className="flex flex-col items-center justify-center px-4 py-10">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                E
              </div>
              <span>E-Cell FC 2k26</span>
            </Link>
          </div>

          {/* Card */}
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-muted-foreground">
                Join our food challenge community
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                    placeholder="Full Name"
                  value={displayName}
                  disabled={otpVerified}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                  value={email}
                  disabled={otpVerified}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium mb-2 col-span-2">Set Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  disabled={otpVerified}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-4 py-2.5 bg-input border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Confirm"
                  value={confirm}
                  disabled={otpVerified}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="px-4 py-2.5 bg-input border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                    placeholder="10-digit Phone Number"
                  value={phone}
                  disabled={otpVerified}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 10) setPhone(v);
                  }}
                  className="w-full px-4 py-2.5 bg-input border rounded-lg"
                />
                {!otpVerified && otpSent && !otpsending && (
                <div className="flex items-center justify-between text-sm">
                    <button
                    type="button"
                    onClick={sendOTP}
                    disabled={cooldown > 0}
                    className={`text-primary font-medium ${
                        cooldown > 0 ? "opacity-50 cursor-not-allowed" : "hover:underline"
                    }`}
                    >
                    Resend OTP
                    </button>

                    {cooldown > 0 && (
                    <span className="text-muted-foreground">
                        Resend in {cooldown}s
                    </span>
                    )}
                </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              {!otpVerified && !otpSent && !otpsending && (
                <button
                  type="button"
                  onClick={sendOTP}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg"
                >
                  Send OTP
                </button>
              )}
              {otpsending && (
                  <button
                    disabled
                    className="w-full py-2.5 bg-primary/50 text-primary-foreground rounded-lg"
                  >
                    Sending OTP...
                  </button>
                )}
              
              {otpSent && !otpVerified && (
                <>
                  <input
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2.5 bg-input border rounded-lg"
                  />
                  {/* <button
                    type="button"
                    onClick={verifyOTP}
                    className="w-full py-2.5 bg-green-600 text-white rounded-lg"
                  >
                    Verify OTP
                  </button> */}
                </>
              )}

              {otpVerified && (
                <p className="text-green-600 text-sm text-center">
                  OTP verified successfully
                </p>
              )}
              {loading ? (
              <button
                disabled
                className="w-full py-2.5 bg-primary/50 text-primary-foreground rounded-lg"
              >
                Creating Account...
              </button>
              ): (
                otp.length === 6 ? (
                <button
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg"
                >
                  Create Account
                </button>
              ) :(
                <button
                 disabled
                  className="w-full py-2.5 bg-primary/50 text-primary-foreground rounded-lg"
                >
                  Create Account
                </button>
              )
            )}
              
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium">
                Login 
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto mt-20 bg-card border rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Set Security PIN</h2>
          <p className="text-muted-foreground mb-6">
            Set a 4-digit PIN to protect your account
          </p>

          <form onSubmit={handleSetPin} className="space-y-4">
            <input
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4-digit PIN"
              className="w-full px-4 py-2.5 bg-input border rounded-lg"
            />
            <input
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm PIN"
              className="w-full px-4 py-2.5 bg-input border rounded-lg"
            />

            <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg">
              Set PIN
            </button>

            {message && (
              <p className="text-center text-sm font-medium mt-3">{message}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
