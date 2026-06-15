import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { exemplares } from '@/services/api';
import { toast } from 'sonner';

interface FormNovoExemplarProps {
  livroId: number;
  livroTitulo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSucesso?: () => void;
}

interface FormData {
  codigoBarras: string;
  condicao: 'Novo' | 'Bom' | 'Regular' | 'Desgastado';
  statusDisponibilidade: 'Disponivel' | 'Emprestado' | 'Manutencao' | 'Perdido';
  dataAquisicao: string;
}

const camposIniciais: FormData = {
  codigoBarras: '',
  condicao: 'Novo',
  statusDisponibilidade: 'Disponivel',
  dataAquisicao: new Date().toISOString().split('T')[0], // hoje
};

const condicoes = ['Novo', 'Bom', 'Regular', 'Desgastado'] as const;
const disponibilidades = [
  { valor: 'Disponivel', label: 'Disponível' },
  { valor: 'Emprestado', label: 'Emprestado' },
  { valor: 'Manutencao', label: 'Manutenção' },
  { valor: 'Perdido', label: 'Perdido' },
] as const;

export default function FormNovoExemplar({
  livroId,
  livroTitulo,
  open,
  onOpenChange,
  onSucesso,
}: FormNovoExemplarProps) {
  const [form, setForm] = useState<FormData>({ ...camposIniciais });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ ...camposIniciais, dataAquisicao: new Date().toISOString().split('T')[0] });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigoBarras.trim()) {
      toast.error('O código de barras é obrigatório');
      return;
    }
    if (!form.dataAquisicao) {
      toast.error('A data de aquisição é obrigatória');
      return;
    }

    setSalvando(true);
    try {
      await exemplares.adicionar(livroId, {
        codigoBarras: form.codigoBarras.trim(),
        condicao: form.condicao,
        statusDisponibilidade: form.statusDisponibilidade,
        dataAquisicao: form.dataAquisicao,
      });
      toast.success('Exemplar cadastrado com sucesso!');
      onOpenChange(false);
      onSucesso?.();
    } catch (err: any) {
      if (err?.response?.status === 409 || err?.response?.data?.erro?.includes('unique')) {
        toast.error('Já existe um exemplar com esse código de barras');
      } else {
        toast.error('Erro ao cadastrar exemplar');
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Adicionar Exemplar</DialogTitle>
          <DialogDescription>
            Cadastrar uma nova cópia física de <strong className="text-foreground">{livroTitulo}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Código de Barras */}
          <div className="space-y-2">
            <Label htmlFor="exemplar-codigo">Código de Barras *</Label>
            <Input
              id="exemplar-codigo"
              placeholder="Ex: BIB-0001"
              value={form.codigoBarras}
              onChange={(e) => setForm((p) => ({ ...p, codigoBarras: e.target.value }))}
              required
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">Cada exemplar deve ter um código único.</p>
          </div>

          {/* Condição + Disponibilidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exemplar-condicao">Condição</Label>
              <select
                id="exemplar-condicao"
                className="sgb-input"
                value={form.condicao}
                onChange={(e) => setForm((p) => ({ ...p, condicao: e.target.value as FormData['condicao'] }))}
              >
                {condicoes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exemplar-disponibilidade">Disponibilidade</Label>
              <select
                id="exemplar-disponibilidade"
                className="sgb-input"
                value={form.statusDisponibilidade}
                onChange={(e) =>
                  setForm((p) => ({ ...p, statusDisponibilidade: e.target.value as FormData['statusDisponibilidade'] }))
                }
              >
                {disponibilidades.map((d) => (
                  <option key={d.valor} value={d.valor}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data de Aquisição */}
          <div className="space-y-2">
            <Label htmlFor="exemplar-data">Data de Aquisição *</Label>
            <Input
              id="exemplar-data"
              type="date"
              value={form.dataAquisicao}
              onChange={(e) => setForm((p) => ({ ...p, dataAquisicao: e.target.value }))}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : 'Cadastrar Exemplar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
