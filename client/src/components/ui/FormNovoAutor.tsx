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
import { autores } from '@/services/api';
import { toast } from 'sonner';

interface FormNovoAutorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSucesso?: () => void;
}

interface FormData {
  nome: string;
  dataNascimento: string;
  nacionalidade: string;
  biografia: string;
}

const camposIniciais: FormData = {
  nome: '',
  dataNascimento: '',
  nacionalidade: '',
  biografia: '',
};

export default function FormNovoAutor({ open, onOpenChange, onSucesso }: FormNovoAutorProps) {
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
      toast.error('O nome do autor é obrigatório');
      return;
    }

    setSalvando(true);
    try {
      await autores.criar({
        nome: form.nome.trim(),
        dataNascimento: form.dataNascimento || undefined,
        nacionalidade: form.nacionalidade.trim() || undefined,
        biografia: form.biografia.trim() || undefined,
      });
      toast.success('Autor cadastrado com sucesso!');
      onOpenChange(false);
      onSucesso?.();
    } catch {
      toast.error('Erro ao cadastrar autor');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Autor</DialogTitle>
          <DialogDescription>
            Preencha os dados do autor. O campo nome é obrigatório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="autor-nome">Nome *</Label>
            <Input
              id="autor-nome"
              placeholder="Ex: Machado de Assis"
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
            />
          </div>

          {/* Data de Nascimento + Nacionalidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="autor-nascimento">Data de Nascimento</Label>
              <Input
                id="autor-nascimento"
                type="date"
                value={form.dataNascimento}
                onChange={(e) => handleChange('dataNascimento', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="autor-nacionalidade">Nacionalidade</Label>
              <Input
                id="autor-nacionalidade"
                placeholder="Ex: Brasileiro"
                value={form.nacionalidade}
                onChange={(e) => handleChange('nacionalidade', e.target.value)}
              />
            </div>
          </div>

          {/* Biografia */}
          <div className="space-y-2">
            <Label htmlFor="autor-biografia">Biografia</Label>
            <Textarea
              id="autor-biografia"
              placeholder="Breve biografia do autor..."
              value={form.biografia}
              onChange={(e) => handleChange('biografia', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : 'Cadastrar Autor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
