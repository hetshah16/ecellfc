// "use client";

// import { useState, useEffect } from "react";
// import { useSearchParams, useRouter } from "next/navigation";

// export default function ResetPasswordPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const email = searchParams.get("email");
//   const token = searchParams.get("token");

//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (newPassword !== confirmPassword) {
//       setMessage("Passwords do not match");
//       return;
//     }

//     try {
//       const res = await fetch("/api/auth/reset", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, token, newPassword }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setMessage("Password reset successful!");
//         setTimeout(() => router.push("/login"), 2000);
//       } else {
//         setMessage(data.error || "Error resetting password");
//       }
//     } catch (err) {
//       setMessage("Server error");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "3rem auto" }}>
//       <h2>Reset Password</h2>
//       {message && <p>{message}</p>}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="password"
//           placeholder="New password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Confirm new password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           required
//         />
//         <button type="submit">Reset Password</button>
//       </form>
//     </div>
//   );
// }



// /app/auth/reset/page.js
import React, { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter a new password for your account. The reset token will be read from the URL.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
            </div>
          }>
            <ResetPasswordClient />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
