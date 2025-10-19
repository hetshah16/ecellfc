"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <div className={styles.container}>
      <h1>Welcome to the Food Challenge!</h1>
      <p>Join us in exploring delicious recipes and exciting cooking challenges.</p>
      <div className="auth-buttons">
        <button className="button" onClick={handleLogin}>
          Login
        </button>
        <button className="button" onClick={handleSignup}>
          Register
        </button>
      </div>
    </div>
  );
}
