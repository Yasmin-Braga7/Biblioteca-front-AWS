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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { generos } from '@/services/api';
import { toast } from 'sonner';

interface FormNovoGeneroProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSucesso?: () => void;
}

interface FormData {
  nome: string;
  descricao: string;
}

const camposIniciais: FormData = {
  nome: '',
  descricao: '',
};

export default function FormNovoGenero({ open, onOpenChange, onSucesso }: FormNovoGeneroProps) {
  const [form, setForm] = useState<FormData>({ ...camposIniciais });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ ...camposIniciais });
    }
  }, [open]);

  const handleChange = (campo: keyof FormData, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error('O nome do gênero é obrigatório');
      return;
    }

    setSalvando(true);
    try {
      await generos.criar({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
      });
      toast.success('Gênero cadastrado com sucesso!');
      onOpenChange(false);
      onSucesso?.();
    } catch (err: any) {
      // Prisma P2002 = unique constraint (nome duplicado)
      if (err?.response?.status === 409 || err?.response?.data?.erro?.includes('unique')) {
        toast.error('Já existe um gênero com esse nome');
      } else {
        toast.error('Erro ao cadastrar gênero');
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Gênero</DialogTitle>
          <DialogDescription>
            Preencha os dados do gênero literário. O campo nome é obrigatório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="genero-nome">Nome *</Label>
            <Input
              id="genero-nome"
              placeholder="Ex: Ficção Científica"
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="genero-descricao">Descrição</Label>
            <Textarea
              id="genero-descricao"
              placeholder="Breve descrição do gênero..."
              value={form.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : 'Cadastrar Gênero'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
