import AdminNavbar from "../components/AdminNavbar"; // client
import AdminDashboard from "../components/AdminDashboard"; // client
import styles from "./page.module.css";

export default function AdminPage() {
  return (
    <div>
      <AdminNavbar />
      <main className={styles.wrap}>
        <h1 className={styles.title}>Admin Console</h1>
        <div className={styles.grid}>
          <AdminDashboard />
        </div>
      </main>
    </div>
  );
}
