// src/components/AbastecimentoForm.jsx
import { useEffect, useState, useRef } from "react";

const COMBUSTIVEIS = (import.meta.env.VITE_COMBUSTIVEIS || "Gasolina,Etanol,Diesel").split(",");
const POSTOS = (import.meta.env.VITE_POSTOS || "Ipiranga,Shell,BR,Texaco,Outros").split(",");
const VALORES_RAPIDOS = [20, 50, 100, 200];

export default function AbastecimentoForm({
  initial,
  onSubmit,
  loading,
  submitLabel = "Salvar",
  fetchUltimoKm,
  fetchVeiculos,
}) {
  const [campos, setCampos] = useState({
    data: initial?.data
      ? initial.data.slice(0, 16)
      : new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    veiculo: initial?.veiculo || "",
    combustivel: initial?.combustivel || COMBUSTIVEIS[0],
    quantidade_litros: initial?.quantidade_litros || 10,
    valor_total: initial?.valor_total || "",
    km_atual: initial?.km_atual || "",
    posto: initial?.posto || POSTOS[0],
  });

  const [veiculoSugestoes, setVeiculoSugestoes] = useState([]);
  const [showVeiculos, setShowVeiculos] = useState(false);
  const [erro, setErro] = useState(null);

  const veiculoInputRef = useRef();

  useEffect(() => {
    let ativo = true;
    if (campos.veiculo.length >= 2 && fetchVeiculos) {
      fetchVeiculos(campos.veiculo).then((sugestoes) => {
        if (ativo) setVeiculoSugestoes(sugestoes);
      });
      setShowVeiculos(true);
    } else {
      setShowVeiculos(false);
    }
    return () => {
      ativo = false;
    };
  }, [campos.veiculo, fetchVeiculos]);

  useEffect(() => {
    let ativo = true;
    if (campos.veiculo && fetchUltimoKm && !initial) {
      fetchUltimoKm(campos.veiculo).then((km) => {
        if (ativo && km !== undefined && km !== null && km !== "") {
          setCampos((c) => ({ ...c, km_atual: km }));
        }
      });
    }
    return () => {
      ativo = false;
    };
  }, [campos.veiculo, fetchUltimoKm, initial]);

  const handleChange = (e) => {
    setCampos({ ...campos, [e.target.name]: e.target.value });
  };

  const handleSlider = (e) => {
    setCampos({ ...campos, quantidade_litros: Number(e.target.value) });
  };

  const handleSetValor = (valor) => {
    setCampos({ ...campos, valor_total: valor });
  };

  const handleVeiculoSelect = (v) => {
    setCampos((c) => ({ ...c, veiculo: v }));
    setShowVeiculos(false);
    veiculoInputRef.current?.blur();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro(null);
    if (!campos.data || !campos.veiculo || !campos.quantidade_litros) {
      setErro("Preencha data, veículo e litros.");
      return;
    }
    onSubmit({
      ...campos,
      quantidade_litros: Number(campos.quantidade_litros),
      valor_total: Number(campos.valor_total),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      {erro && (
        <div className="text-red-500 dark:text-red-400 text-sm p-2 bg-red-100 dark:bg-red-900/30 rounded">
          {erro}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="data" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Data e hora
        </label>
        <input
          id="data"
          type="datetime-local"
          name="data"
          value={campos.data}
          onChange={handleChange}
          className="p-3 h-12 border rounded-lg bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-600 dark:focus:ring-pink-500"
          required
        />
      </div>

      <div className="flex flex-col gap-1 relative">
        <label htmlFor="veiculo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Veículo
        </label>
        <input
          id="veiculo"
          ref={veiculoInputRef}
          type="text"
          name="veiculo"
          autoComplete="off"
          placeholder="Digite o veículo"
          value={campos.veiculo}
          onChange={handleChange}
          onFocus={() => setShowVeiculos(veiculoSugestoes.length > 0)}
          className="p-3 h-12 border rounded-lg bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-600 dark:focus:ring-pink-500"
          required
        />
        {showVeiculos && veiculoSugestoes.length > 0 && (
          <ul className="absolute z-10 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg w-full max-h-40 overflow-y-auto mt-1 shadow-lg">
            {veiculoSugestoes.map((v, i) => (
              <li
                key={i}
                className="px-4 py-3 hover:bg-indigo-50 dark:hover:bg-pink-900/30 cursor-pointer text-gray-900 dark:text-gray-100"
                onMouseDown={() => handleVeiculoSelect(v)}
              >
                {v}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="combustivel" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Combustível
        </label>
        <select
          id="combustivel"
          name="combustivel"
          value={campos.combustivel}
          onChange={handleChange}
          className="p-3 h-12 border rounded-lg bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-600 dark:focus:ring-pink-500"
        >
          {COMBUSTIVEIS.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="quantidade_litros" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Quantidade (Litros)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="quantidade_litros"
            type="range"
            name="quantidade_litros"
            value={campos.quantidade_litros}
            min={1}
            max={100}
            step={0.1}
            onChange={handleSlider}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-semibold text-indigo-600 dark:text-pink-500 min-w-16">
            {campos.quantidade_litros} L
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Valor Total</label>
        <div className="flex flex-wrap gap-2">
          {VALORES_RAPIDOS.map((v) => (
            <button
              type="button"
              key={v}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition
                ${
                  campos.valor_total == v
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-white text-indigo-600 border border-indigo-500 hover:bg-indigo-50 dark:bg-neutral-800 dark:text-pink-500 dark:border-pink-500 dark:hover:bg-pink-900/30"
                }`}
              onClick={() => handleSetValor(v)}
            >
              R$ {v}
            </button>
          ))}
          <input
            type="number"
            name="valor_total"
            placeholder="Outro valor"
            value={campos.valor_total}
            onChange={handleChange}
            step="0.01"
            min={0}
            className="p-3 h-12 border rounded-lg bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-600 dark:focus:ring-pink-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="km_atual" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          KM Atual
        </label>
        <input
          id="km_atual"
          type="number"
          name="km_atual"
          value={campos.km_atual}
          onChange={handleChange}
          className="p-3 h-12 border rounded-lg bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-600 dark:focus:ring-pink-500"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="posto" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Posto
        </label>
        <select
          id="posto"
          name="posto"
          value={campos.posto}
          onChange={handleChange}
          className="p-3 h-12 border rounded-lg bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-600 dark:focus:ring-pink-500"
        >
          {POSTOS.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="p-3 h-12 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 dark:bg-pink-500 dark:hover:bg-pink-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600"
        disabled={loading}
      >
        {loading ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}