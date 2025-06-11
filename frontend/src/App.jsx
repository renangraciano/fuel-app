// src/App.jsx
import { useState, useEffect } from "react";
import Modal from "./components/Modal";
import AbastecimentoForm from "./components/AbastecimentoForm";
import DarkModeToggle from "./components/DarkModeToggle";

const EditIcon = () => <span className="inline-block text-indigo-700 dark:text-pink-400">✏️</span>;
const DeleteIcon = () => <span className="inline-block text-rose-700 dark:text-violet-400">🗑️</span>;
const AddIcon = () => <span className="inline-block text-green-700 dark:text-green-400">➕</span>;

const API_URL = import.meta.env.VITE_API_URL;

function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString() : "";
}

export default function App() {
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [veiculo, setVeiculo] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchAbastecimentos = async (paramsPage = pagina) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (veiculo) params.append("veiculo", veiculo);
    if (dataInicial) params.append("dataInicial", dataInicial);
    if (dataFinal) params.append("dataFinal", dataFinal);
    params.append("limit", 10);
    params.append("page", paramsPage);

    try {
      const url = `${API_URL}?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      setAbastecimentos(data.data || []);
      setTotalPaginas(data.totalPaginas || 1);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      console.error("Erro ao buscar abastecimentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbastecimentos();
    // eslint-disable-next-line
  }, [pagina]);

  const handleBuscar = (e) => {
    e.preventDefault();
    setPagina(1);
    fetchAbastecimentos(1);
  };

  const handleNovo = () => {
    setEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (id) => {
    const registro = abastecimentos.find((a) => a._id === id);
    setEditando(registro);
    setModalOpen(true);
  };

  const handleRemover = async (id) => {
    if (window.confirm("Deseja remover este lançamento?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchAbastecimentos();
      } catch (err) {
        console.error("Erro ao remover abastecimento:", err);
      }
    }
  };

  const handleSalvar = async (dados) => {
    setFormLoading(true);
    try {
      const url = editando ? `${API_URL}/${editando._id}` : API_URL;
      const method = editando ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setModalOpen(false);
      fetchAbastecimentos(1);
      setPagina(1);
    } catch (err) {
      alert("Erro ao salvar dados: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const fetchVeiculos = async (texto) => {
    if (!texto) return [];
    try {
      const res = await fetch(`${API_URL}/veiculos?q=${encodeURIComponent(texto)}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error("Erro ao buscar veículos:", err);
      return [];
    }
  };

  const fetchUltimoKm = async (veiculo) => {
    if (!veiculo) return "";
    try {
      const res = await fetch(`${API_URL}/ultimo-km?veiculo=${encodeURIComponent(veiculo)}`);
      if (!res.ok) return "";
      const data = await res.json();
      return data.km_atual !== undefined ? String(data.km_atual) : "";
    } catch (err) {
      console.error("Erro ao buscar último KM:", err);
      return "";
    }
  };

  return (
    <div className="max-w-md mx-auto p-2 min-h-screen bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100 transition-colors">
      <div className="p-2 mb-2 bg-white dark:bg-black text-black dark:text-white">
        Theme: {document.documentElement.classList.contains("dark") ? "Dark" : "Light"}
      </div>
      <header className="flex items-center justify-between mb-4">
        <h1 className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-2xl font-extrabold text-transparent select-none">
          Abastecimentos
        </h1>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <button
            className="p-3 rounded-lg bg-indigo-500 text-white shadow hover:bg-indigo-600 dark:bg-pink-500 dark:hover:bg-pink-600"
            onClick={handleNovo}
            aria-label="Novo lançamento"
            type="button"
          >
            <AddIcon />
          </button>
        </div>
      </header>

      <form
        onSubmit={handleBuscar}
        className="flex flex-col gap-2 bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg mb-4"
      >
        <input
          type="text"
          placeholder="Veículo (ex: ABC-1234)"
          value={veiculo}
          onChange={(e) => setVeiculo(e.target.value)}
          className="p-3 h-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:focus:ring-pink-500"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="p-3 h-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 flex-1 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:focus:ring-pink-500"
          />
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="p-3 h-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 flex-1 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:focus:ring-pink-500"
          />
        </div>
        <button
          type="submit"
          className="p-3 h-12 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-pink-500 dark:hover:bg-pink-600"
        >
          Buscar
        </button>
      </form>

      <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg shadow">
        {loading ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">Carregando...</div>
        ) : abastecimentos.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">Nenhum registro</div>
        ) : (
          <ul>
            {abastecimentos.map((a) => (
              <li
                key={a._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-neutral-700 last:border-b-0 p-3 gap-2"
              >
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(a.data)} - {a.veiculo}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {a.combustivel} | {a.quantidade_litros}L | R$ {a.valor_total}
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    KM: {a.km_atual} | Posto: {a.posto}
                  </div>
                </div>
                <div className="flex gap-3 mt-2 sm:mt-0">
                  <button
                    className="p-2 hover:bg-indigo-100 dark:hover:bg-pink-900 rounded-lg"
                    aria-label="Editar abastecimento"
                    onClick={() => handleEditar(a._id)}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="p-2 hover:bg-rose-100 dark:hover:bg-violet-900 rounded-lg"
                    aria-label="Remover abastecimento"
                    onClick={() => handleRemover(a._id)}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-center items-center gap-2 mt-4 text-sm">
        <button
          onClick={() => setPagina((p) => Math.max(p - 1, 1))}
          className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-pink-900 dark:text-pink-200 dark:hover:bg-pink-800 disabled:opacity-50"
          disabled={pagina === 1}
        >
          Anterior
        </button>
        <span className="text-gray-700 dark:text-gray-300">
          Página {pagina} de {totalPaginas} · {totalCount} lançamentos
        </span>
        <button
          onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
          className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-pink-900 dark:text-pink-200 dark:hover:bg-pink-800 disabled:opacity-50"
          disabled={pagina === totalPaginas}
        >
          Próxima
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-xl font-extrabold text-transparent">
            {editando ? "Editar Abastecimento" : "Novo Abastecimento"}
          </span>
        }
      >
        <AbastecimentoForm
          initial={editando}
          onSubmit={handleSalvar}
          loading={formLoading}
          submitLabel={editando ? "Salvar Alterações" : "Cadastrar"}
          fetchUltimoKm={fetchUltimoKm}
          fetchVeiculos={fetchVeiculos}
        />
      </Modal>
    </div>
  );
}