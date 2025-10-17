export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Welcome to Real View Simulator 2025</h1>
      <p>Click below to start your interview simulation.</p>
      <a 
        href="/interview" 
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "10px 20px",
          background: "#0070f3",
          color: "white",
          borderRadius: 6,
          textDecoration: "none"
        }}
      >
        Start the Interview →
      </a>
    </main>
  );
}