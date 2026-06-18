import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usuarios } from '@/services/api';
import ImageCropper from '@/components/ui/ImageCropper';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Shield,
  CalendarDays,
  User,
  Upload,
  Loader2,
  CheckCircle2,
  Building2,
  Pencil,
  Save,
  Search,
} from 'lucide-react';

// Valores padrão do banco que devem ser tratados como "vazio"
const VALORES_PADRAO = ['Não informado', 'S/N', 'NI', '00000000', '000000000', 'não informado'];

/** Se o valor é um placeholder do banco, retorna string vazia */
function limparPadrao(valor: string | undefined | null): string {
  if (!valor) return '';
  if (VALORES_PADRAO.includes(valor.trim())) return '';
  return valor;
}

export default function Perfil() {
  const { usuario: authUser } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fotoKey, setFotoKey] = useState(Date.now());
  const [fotoError, setFotoError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado do cropper de foto de perfil
  const [cropperAberto, setCropperAberto] = useState(false);
  const [imagemParaCropar, setImagemParaCropar] = useState<string | null>(null);

  // modais
  const [modalDados, setModalDados] = useState(false);
  const [modalEndereco, setModalEndereco] = useState(false);
  const [modalVerEndereco, setModalVerEndereco] = useState(false);
  const [modalTelefone, setModalTelefone] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // formulários
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

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
      if (d.length <= 2)  return d.length ? `(${d}` : '';
      if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
      return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    } else {
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
    const digits = telefoneNum.replace(/\D/g, '');
    setTelefoneNum(aplicarMascara(digits, novoTipo));
  }

  useEffect(() => {
    if (authUser?.usuario_id) carregarPerfil();
  }, [authUser?.usuario_id]);

  async function carregarPerfil() {
    try {
      setCarregando(true);
      const data = await usuarios.obterPorId(authUser!.usuario_id);
      setPerfil(data);
    } catch {
      toast.error('Erro ao carregar perfil');
    } finally {
      setCarregando(false);
    }
  }

  // ─── Upload de foto (abre cropper) ──────────────────────────────────────────
  function handleSelecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Formato não suportado. Use JPG ou PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }
    // Abre o cropper
    if (imagemParaCropar) URL.revokeObjectURL(imagemParaCropar);
    setImagemParaCropar(URL.createObjectURL(file));
    setCropperAberto(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleCropConfirm(croppedFile: File) {
    setCropperAberto(false);
    if (imagemParaCropar) URL.revokeObjectURL(imagemParaCropar);
    setImagemParaCropar(null);
    try {
      setUploading(true);
      await usuarios.uploadFoto(authUser!.usuario_id, croppedFile);
      setFotoKey(Date.now());
      setFotoError(false);
      toast.success('Foto atualizada com sucesso!');
    } catch {
      toast.error('Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  }

  function handleCropCancel() {
    setCropperAberto(false);
    if (imagemParaCropar) URL.revokeObjectURL(imagemParaCropar);
    setImagemParaCropar(null);
  }

  // ─── Abrir modais (limpa valores padrão do banco) ───────────────────────────
  function abrirModalDados() {
    setNome(perfil?.usuario_nome || '');
    setEmail(perfil?.usuario_email || '');
    setModalDados(true);
  }

  function abrirModalEndereco() {
    setRua(limparPadrao(perfil?.endereco?.endereco_rua));
    setNumero(limparPadrao(perfil?.endereco?.endereco_numero));
    setComplemento(limparPadrao(perfil?.endereco?.endereco_complemento));
    setBairro(limparPadrao(perfil?.endereco?.endereco_bairro));
    setCidade(limparPadrao(perfil?.endereco?.endereco_cidade));
    setEstado(limparPadrao(perfil?.endereco?.endereco_estado));
    setCep(limparPadrao(perfil?.endereco?.endereco_cep));
    setModalEndereco(true);
  }

  // ─── Busca CEP via ViaCEP ───────────────────────────────────────────────────
  async function buscarCep(cepDigitado: string) {
    const cepLimpo = cepDigitado.replace(/\D/g, '');
    setCep(cepDigitado);
    if (cepLimpo.length !== 8) return;
    try {
      setBuscandoCep(true);
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error('CEP não encontrado.');
        return;
      }
      setRua(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(data.localidade || '');
      setEstado(data.uf || '');
      toast.success('Endereço preenchido pelo CEP!');
    } catch {
      toast.error('Erro ao buscar CEP.');
    } finally {
      setBuscandoCep(false);
    }
  }

  function abrirModalTelefone() {
    const num = limparPadrao(perfil?.telefone?.telefone_numero);
    const tipo = (perfil?.telefone?.telefone_tipo || 'Celular') as 'Celular' | 'Residencial' | 'Comercial';
    setTelefoneTipo(tipo);
    setTelefoneNum(aplicarMascara(num.replace(/\D/g, ''), tipo));
    setModalTelefone(true);
  }

  // ─── Salvar edições ─────────────────────────────────────────────────────────
  async function salvarDados() {
    if (!nome.trim() || !email.trim()) {
      toast.error('Nome e e-mail são obrigatórios.');
      return;
    }
    try {
      setSalvando(true);
      await usuarios.atualizar(authUser!.usuario_id, { nome, email } as any);
      toast.success('Dados atualizados com sucesso!');
      setModalDados(false);
      await carregarPerfil();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao salvar dados');
    } finally {
      setSalvando(false);
    }
  }

  async function salvarEndereco() {
    if (!rua.trim() || !cidade.trim() || !estado.trim()) {
      toast.error('Rua, cidade e estado são obrigatórios.');
      return;
    }
    try {
      setSalvando(true);
      await usuarios.atualizarEndereco(authUser!.usuario_id, {
        rua, numero: numero || 'S/N', complemento, bairro, cidade, estado, cep,
      });
      toast.success('Endereço atualizado com sucesso!');
      setModalEndereco(false);
      await carregarPerfil();
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
      await usuarios.atualizarTelefone(authUser!.usuario_id, {
        numero: telefoneNum,
        tipo: telefoneTipo,
      });
      toast.success('Telefone atualizado com sucesso!');
      setModalTelefone(false);
      await carregarPerfil();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao salvar telefone');
    } finally {
      setSalvando(false);
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const initials = perfil?.usuario_nome
    ? perfil.usuario_nome.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : '?';

  const fotoUrl = authUser ? usuarios.getFotoUrl(authUser.usuario_id) : '';

  function formatDate(dateStr: string) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  /** Exibe o valor ou '—' se for um placeholder do banco */
  function exibir(valor: string | undefined | null): string {
    if (!valor) return '—';
    if (VALORES_PADRAO.includes(valor.trim())) return '—';
    return valor;
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'Ativo': return 'badge-green';
      case 'Inativo': return 'badge-gray';
      case 'Bloqueado': return 'badge-red';
      default: return 'badge-gray';
    }
  }

  function getTipoBadgeClass(tipo: string) {
    switch (tipo) {
      case 'Bibliotecario': return 'badge-purple';
      case 'Leitor': return 'badge-blue';
      default: return 'badge-gray';
    }
  }

  if (carregando) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-enter max-w-4xl mx-auto space-y-6">
        {/* ─── Header com foto ─────────────────────────────────────────── */}
        <div className="glass-card overflow-hidden">
          <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/50 dark:from-primary/40 dark:via-primary/20 dark:to-accent/30 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptMC0zMHY2aC02VjRoNnptMCAxMnY2aC02VjE2aDZ6bTAgMTJ2Nmg2VjI4aC02em0xMi0xMnY2aC02VjE2aDZ6bS0xMi0xMnY2aC02VjRoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          </div>

          <div className="px-6 pb-6 -mt-16 sm:-mt-20 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              {/* Avatar com upload */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-secondary flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
                  {!fotoError ? (
                    <img
                      key={fotoKey}
                      src={`${fotoUrl}?t=${fotoKey}`}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                      onError={() => setFotoError(true)}
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold text-white select-none">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-white" />
                        <span className="text-xs text-white font-medium">Trocar foto</span>
                      </>
                    )}
                  </div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleSelecionarFoto} className="hidden" />
              </div>

              {/* Nome + badges */}
              <div className="text-center sm:text-left pb-1 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {perfil?.usuario_nome || '—'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{perfil?.usuario_email}</p>
                <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getTipoBadgeClass(perfil?.usuario_tipo)}`}>
                    <Shield className="w-3 h-3" />
                    {perfil?.usuario_tipo}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(perfil?.usuario_status)}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {perfil?.usuario_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Grid de dados ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ════════ Dados Pessoais ════════ */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados Pessoais
              </h2>
              <button onClick={abrirModalDados} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" title="Editar">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <InfoRow icon={<User className="w-4 h-4" />} label="Nome completo" value={perfil?.usuario_nome} />
              <InfoRow icon={<Mail className="w-4 h-4" />} label="E-mail" value={perfil?.usuario_email} />
              <InfoRow icon={<CalendarDays className="w-4 h-4" />} label="Data de cadastro" value={formatDate(perfil?.usuario_data_cadastro)} />
            </div>
          </div>

          {/* ════════ Endereço ════════ */}
          <div 
            className="glass-card p-6 space-y-5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            onClick={() => setModalVerEndereco(true)}
            title="Ver endereço completo"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Endereço
              </h2>
              <button 
                onClick={(e) => { e.stopPropagation(); abrirModalEndereco(); }} 
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" 
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            {perfil?.endereco ? (
              <div className="space-y-4 pointer-events-none">
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Rua" value={`${exibir(perfil.endereco.endereco_rua)}${exibir(perfil.endereco.endereco_numero) !== '—' ? `, ${exibir(perfil.endereco.endereco_numero)}` : ''}`} />
                <InfoRow icon={<Building2 className="w-4 h-4" />} label="Bairro" value={exibir(perfil.endereco.endereco_bairro)} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Cidade / Estado" value={exibir(perfil.endereco.endereco_cidade) !== '—' ? `${exibir(perfil.endereco.endereco_cidade)} - ${exibir(perfil.endereco.endereco_estado)}` : '—'} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Endereço não cadastrado.</p>
            )}
          </div>

          {/* ════════ Telefone ════════ */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Telefone
              </h2>
              <button onClick={abrirModalTelefone} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" title="Editar">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            {perfil?.telefone ? (
              <div className="space-y-4">
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Número" value={exibir(perfil.telefone.telefone_numero)} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Telefone não cadastrado.</p>
            )}
          </div>

          {/* ════════ Dicas ════════ */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Sobre a foto
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Formatos aceitos: <strong>JPG</strong> ou <strong>PNG</strong>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Tamanho máximo: <strong>5 MB</strong>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Passe o mouse sobre a foto para alterar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ─── MODAL: Editar Dados Pessoais ──────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={modalDados} onOpenChange={setModalDados}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Editar Dados Pessoais
            </DialogTitle>
            <DialogDescription>Atualize seu nome e e-mail.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <ModalField label="Nome completo" value={nome} onChange={setNome} placeholder="Digite seu nome" />
            <ModalField label="E-mail" value={email} onChange={setEmail} placeholder="Digite seu e-mail" type="email" />
          </div>

          <DialogFooter>
            <button onClick={() => setModalDados(false)} className="sgb-btn-secondary text-sm">
              Cancelar
            </button>
            <button onClick={salvarDados} disabled={salvando} className="sgb-btn-primary flex items-center gap-2 text-sm">
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ─── MODAL: Editar Endereço ────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={modalEndereco} onOpenChange={setModalEndereco}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Editar Endereço
            </DialogTitle>
            <DialogDescription>Atualize seu endereço de contato.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* CEP no topo — busca automática */}
            <div>
              <label className="sgb-label">CEP</label>
              <div className="relative">
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => buscarCep(e.target.value)}
                  placeholder="Digite seu CEP"
                  className="sgb-input pr-10"
                  maxLength={9}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {buscandoCep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Digite o CEP e os campos serão preenchidos automaticamente</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <ModalField label="Rua" value={rua} onChange={setRua} placeholder="Nome da rua" />
              </div>
              <ModalField label="Número" value={numero} onChange={setNumero} placeholder="Nº" required={false} />
            </div>
            <ModalField label="Complemento" value={complemento} onChange={setComplemento} placeholder="Apto, bloco, etc." required={false} />
            <ModalField label="Bairro" value={bairro} onChange={setBairro} placeholder="Nome do bairro" required={false} />
            <div className="grid grid-cols-2 gap-3">
              <ModalField label="Cidade" value={cidade} onChange={setCidade} placeholder="Cidade" />
              <ModalField label="Estado" value={estado} onChange={setEstado} placeholder="UF" maxLength={2} />
            </div>
          </div>

          <DialogFooter>
            <button onClick={() => setModalEndereco(false)} className="sgb-btn-secondary text-sm">
              Cancelar
            </button>
            <button onClick={salvarEndereco} disabled={salvando} className="sgb-btn-primary flex items-center gap-2 text-sm">
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ─── MODAL: Editar Telefone ────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={modalTelefone} onOpenChange={setModalTelefone}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Editar Telefone
            </DialogTitle>
            <DialogDescription>Atualize seu número de contato.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="sgb-label mb-2 block">Tipo</label>
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

            <div>
              <label className="sgb-label">
                Número <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={telefoneNum}
                  onChange={handleTelefoneChange}
                  placeholder={TELEFONE_CONFIG[telefoneTipo].placeholder}
                  maxLength={telefoneTipo === 'Celular' ? 15 : 14}
                  className="sgb-input pr-16"
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums ${
                  telefoneNum.replace(/\D/g, '').length === TELEFONE_CONFIG[telefoneTipo].digitos
                    ? 'text-green-500'
                    : 'text-muted-foreground'
                }`}>
                  {telefoneNum.replace(/\D/g, '').length}/{TELEFONE_CONFIG[telefoneTipo].digitos}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button onClick={() => setModalTelefone(false)} className="sgb-btn-secondary text-sm">
              Cancelar
            </button>
            <button onClick={salvarTelefone} disabled={salvando} className="sgb-btn-primary flex items-center gap-2 text-sm">
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ─── MODAL: Ver Endereço Completo ──────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={modalVerEndereco} onOpenChange={setModalVerEndereco}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Endereço Completo
            </DialogTitle>
            <DialogDescription>Detalhes do seu endereço cadastrado.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
            {perfil?.endereco ? (
              <>
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Rua / Número" value={`${exibir(perfil.endereco.endereco_rua)}${exibir(perfil.endereco.endereco_numero) !== '—' ? `, ${exibir(perfil.endereco.endereco_numero)}` : ''}`} />
                <InfoRow icon={<Building2 className="w-4 h-4" />} label="Complemento" value={exibir(perfil.endereco.endereco_complemento)} />
                <InfoRow icon={<Building2 className="w-4 h-4" />} label="Bairro" value={exibir(perfil.endereco.endereco_bairro)} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Cidade / Estado" value={exibir(perfil.endereco.endereco_cidade) !== '—' ? `${exibir(perfil.endereco.endereco_cidade)} - ${exibir(perfil.endereco.endereco_estado)}` : '—'} />
                <InfoRow icon={<Mail className="w-4 h-4" />} label="CEP" value={exibir(perfil.endereco.endereco_cep)} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">Nenhum endereço cadastrado.</p>
            )}
          </div>

          <DialogFooter>
            <button onClick={() => setModalVerEndereco(false)} className="sgb-btn-secondary text-sm w-full">
              Fechar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cropper de foto de perfil */}
      {imagemParaCropar && (
        <ImageCropper
          open={cropperAberto}
          imageSrc={imagemParaCropar}
          onCropComplete={handleCropConfirm}
          onCancel={handleCropCancel}
          aspectRatio={1}
          outputWidth={800}
          outputHeight={800}
          title="Recortar Foto de Perfil"
          description="Ajuste sua foto na área de corte. A imagem será salva em 800×800px."
          cropShape="round"
        />
      )}
    </DashboardLayout>
  );
}

/* ─── Componente auxiliar: linha de informação (somente leitura) ────────────── */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5 break-words">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

/* ─── Componente auxiliar: campo de formulário para modal ──────────────────── */
function ModalField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = true,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="sgb-label">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="sgb-input"
        maxLength={maxLength}
      />
    </div>
  );
}
