import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) {
        setErro("E-mail ou senha inválidos");
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      onLogin();
    } catch {
      setErro("Erro ao conectar.");
    }
  };

  return (
    <div className="max-w-xs mx-auto mt-32 bg-white/80 p-8 rounded shadow dark:bg-neutral-900">
      <h2 className="text-xl font-bold mb-4 text-center text-pink-600 dark:text-purple-300">Login</h2>
      {erro && <div className="mb-2 text-red-600">{erro}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="E-mail"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="p-2 rounded border border-pink-400 focus:ring-2 focus:ring-purple-400 dark:bg-neutral-800 dark:text-white"
        />
        <input
          type="password"
          placeholder="Senha"
          required
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="p-2 rounded border border-pink-400 focus:ring-2 focus:ring-purple-400 dark:bg-neutral-800 dark:text-white"
        />
        <button
          type="submit"
          className="bg-pink-600 text-white rounded p-2 font-bold hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-pink-600"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}