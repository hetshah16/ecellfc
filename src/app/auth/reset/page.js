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
    <main style={{ padding: 24 }}>
      <div style={{ maxWidth: 680, margin: "2rem auto" }}>
        <h1 style={{ marginBottom: 8 }}>Reset Password</h1>
        <p style={{ marginTop: 0, color: "#6b7280" }}>
          Enter a new password for your account. The reset token will be read from the URL.
        </p>

        <Suspense fallback={<div style={{ padding: 18 }}>Loading reset form…</div>}>
          <ResetPasswordClient />
        </Suspense>
      </div>
    </main>
  );
}
