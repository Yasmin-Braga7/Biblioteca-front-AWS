import { useState } from 'react';
import { useLocation } from 'wouter';
import { usuarios as api } from '@/services/api';
import { toast } from 'sonner';
import {
  MapPin,
  Phone,
  ArrowRight,
  SkipForward,
  CheckCircle2,
  Loader2,
  Info,
  Search,
} from 'lucide-react';

interface Props {
  usuarioId: number;
}

export default function CompletarPerfil({ usuarioId }: Props) {
  const [, navigate] = useLocation();
  const [etapa, setEtapa] = useState<'endereco' | 'telefone'>('endereco');
  const [salvando, setSalvando] = useState(false);

  // endereço
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

  // ── NOVO: estado do autocomplete ──────────────────────────────────
  const [buscandoCep, setBuscandoCep] = useState(false);

  async function buscarCep(valor: string) {
    const apenasDigitos = valor.replace(/\D/g, '');
    if (apenasDigitos.length !== 8) return;

    try {
      setBuscandoCep(true);
      const res = await fetch(`https://viacep.com.br/ws/${apenasDigitos}/json/`);
      const data = await res.json();

      if (data.erro) {
        toast.error('CEP não encontrado.');
        return;
      }

      setRua(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(data.localidade || '');
      setEstado(data.uf || '');
      toast.success('Endereço preenchido automaticamente!');
    } catch {
      toast.error('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setBuscandoCep(false);
    }
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const valor = e.target.value;

    // Formata enquanto digita: 00000-000
    const digits = valor.replace(/\D/g, '').slice(0, 8);
    const formatado = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatado);

    // Dispara busca ao completar 8 dígitos
    if (digits.length === 8) {
      buscarCep(digits);
    }
  }
  // ─────────────────────────────────────────────────────────────────

  async function salvarEndereco() {
    if (!rua.trim() || !cidade.trim() || !estado.trim()) {
      toast.error('Rua, cidade e estado são obrigatórios.');
      return;
    }
    try {
      setSalvando(true);
      await api.atualizarEndereco(usuarioId, {
        rua, numero, complemento, bairro, cidade, estado, cep,
      });
      toast.success('Endereço salvo!');
      setEtapa('telefone');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao salvar endereço');
    } finally {
      setSalvando(false);
    }
  }

  async function salvarTelefone() {
    if (!telefoneNum.trim()) {
      toast.error('Número é obrigatório.');
      return;
    }
    try {
      setSalvando(true);
      await api.atualizarTelefone(usuarioId, {
        numero: telefoneNum,
        tipo: telefoneTipo,
      });
      toast.success('Telefone salvo! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao salvar telefone');
    } finally {
      setSalvando(false);
    }
  }

  function pularEtapa() {
    if (etapa === 'endereco') {
      setEtapa('telefone');
    } else {
      toast.success('Conta criada! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 1200);
    }
  }

  // telefone
  const [telefoneNum, setTelefoneNum] = useState('');
  const [telefoneTipo, setTelefoneTipo] = useState<'Celular' | 'Residencial' | 'Comercial'>('Celular');

  // ── Regras por tipo ──────────────────────────────────────────────
  const TELEFONE_CONFIG = {
    Celular:      { digitos: 11, mascara: '(XX) XXXXX-XXXX', placeholder: '(21) 99999-9999' },
    Residencial:  { digitos: 10, mascara: '(XX) XXXX-XXXX',  placeholder: '(21) 3333-4444'  },
    Comercial:    { digitos: 10, mascara: '(XX) XXXX-XXXX',  placeholder: '(21) 3333-4444'  },
  } as const;

  function aplicarMascara(digits: string, tipo: typeof telefoneTipo): string {
    const max = TELEFONE_CONFIG[tipo].digitos;
    const d = digits.slice(0, max);
    if (tipo === 'Celular') {
      // (XX) XXXXX-XXXX
      if (d.length <= 2)  return d.length ? `(${d}` : '';
      if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
      return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    } else {
      // (XX) XXXX-XXXX
      if (d.length <= 2)  return d.length ? `(${d}` : '';
      if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
      return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    }
  }

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    const max = TELEFONE_CONFIG[telefoneTipo].digitos;
    setTelefoneNum(aplicarMascara(digits.slice(0, max), telefoneTipo));
  }

  function handleTipoChange(novoTipo: typeof telefoneTipo) {
    setTelefoneTipo(novoTipo);
    // Re-aplica máscara com as regras do novo tipo
    const digits = telefoneNum.replace(/\D/g, '');
    setTelefoneNum(aplicarMascara(digits, novoTipo));
  }

  const inputClass =
    'w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 mt-1';

  return (
    <div className="space-y-6">
      {/* Indicador de etapa */}
      <div className="flex items-center justify-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
          etapa === 'endereco'
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800'
        }`}>
          {etapa === 'endereco' ? (
            <MapPin className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          Endereço
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
          etapa === 'telefone'
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'bg-muted text-muted-foreground border border-border'
        }`}>
          <Phone className="w-3.5 h-3.5" />
          Telefone
        </div>
      </div>

      {/* ─── Etapa Endereço ───────────────────────────────────────────── */}
      {etapa === 'endereco' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="text-center mb-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Seu endereço</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Digite o CEP para preencher automaticamente
            </p>
          </div>

          {/* ── CEP com indicador de loading ── */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">CEP</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                className={`${inputClass} mt-0 pr-9`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                {buscandoCep
                  ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  : <Search className="w-4 h-4 opacity-40" />
                }
              </div>
            </div>
          </div>

          {/* ── Rua + Número (preenchidos pelo CEP) ── */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Rua <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Número</label>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className={inputClass}
                autoFocus={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Complemento</label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className={inputClass}
                placeholder="Apto, bloco, etc."
              />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Bairro</label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Cidade <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Estado <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                maxLength={2}
                placeholder="UF"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={salvarEndereco}
              disabled={salvando}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {salvando
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><ArrowRight className="w-4 h-4" /> Salvar e continuar</>
              }
            </button>
            <button
              onClick={pularEtapa}
              className="px-4 py-3 text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm border border-slate-200 dark:border-slate-600"
            >
              <SkipForward className="w-4 h-4" /> Pular
            </button>
          </div>
        </div>
      )}

      {/* ─── Etapa Telefone ───────────────────────────────────────────── */}
      {etapa === 'telefone' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="text-center mb-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Seu telefone</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Para que possamos entrar em contato se necessário
            </p>
          </div>

          {/* ── Seletor de tipo visual ── */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2 block">
              Tipo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    tipo: 'Celular',
                    label: 'Celular',
                    sub: '9 dígitos',
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <rect x="7" y="2" width="10" height="20" rx="2"/>
                        <circle cx="12" cy="17.5" r="0.8" fill="currentColor"/>
                      </svg>
                    ),
                  },
                  {
                    tipo: 'Residencial',
                    label: 'Residencial',
                    sub: '8 dígitos',
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                        <path d="M9 21V12h6v9"/>
                      </svg>
                    ),
                  },
                  {
                    tipo: 'Comercial',
                    label: 'Comercial',
                    sub: '8 dígitos',
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <rect x="2" y="7" width="20" height="14" rx="1"/>
                        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                        <line x1="12" y1="12" x2="12" y2="16"/>
                        <line x1="10" y1="14" x2="14" y2="14"/>
                      </svg>
                    ),
                  },
                ] as const
              ).map(({ tipo, label, sub, icon }) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleTipoChange(tipo)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 font-semibold text-xs transition-all ${
                    telefoneTipo === tipo
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  {icon}
                  <span className="text-[11px] font-bold">{label}</span>
                  <span className={`text-[10px] ${telefoneTipo === tipo ? 'text-primary/70' : 'text-muted-foreground'}`}>
                    {sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Input com contador ── */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
              Número <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1">
              <input
                type="tel"
                value={telefoneNum}
                onChange={handleTelefoneChange}
                placeholder={TELEFONE_CONFIG[telefoneTipo].placeholder}
                maxLength={telefoneTipo === 'Celular' ? 15 : 14} // chars formatados
                className="w-full p-3 pr-16 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
              />
              {/* Contador de dígitos */}
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums ${
                telefoneNum.replace(/\D/g, '').length === TELEFONE_CONFIG[telefoneTipo].digitos
                  ? 'text-green-500'
                  : 'text-muted-foreground'
              }`}>
                {telefoneNum.replace(/\D/g, '').length}/{TELEFONE_CONFIG[telefoneTipo].digitos}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={salvarTelefone}
              disabled={salvando}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {salvando
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><CheckCircle2 className="w-4 h-4" /> Finalizar</>
              }
            </button>
            <button
              onClick={pularEtapa}
              className="px-4 py-3 text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm border border-slate-200 dark:border-slate-600"
            >
              <SkipForward className="w-4 h-4" /> Pular
            </button>
          </div>
        </div>
      )}

      {/* ─── Aviso ── */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-semibold">Pode completar depois!</p>
          <p className="mt-1 text-blue-600 dark:text-blue-400">
            Após fazer login, acesse <strong>Meu Perfil</strong> clicando no seu avatar no canto superior direito.
          </p>
        </div>
      </div>
    </div>
  );
}