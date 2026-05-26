import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  exemplares: number;
  disponivel: number;
  status: 'ativo' | 'inativo';
}

export default function Catalogo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [livros] = useState<Livro[]>([
    {
      id: 1,
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      genero: 'Romance',
      exemplares: 5,
      disponivel: 3,
      status: 'ativo',
    },
    {
      id: 2,
      titulo: 'O Cortiço',
      autor: 'Aluísio Azevedo',
      genero: 'Romance',
      exemplares: 3,
      disponivel: 1,
      status: 'ativo',
    },
    {
      id: 3,
      titulo: 'Grande Sertão: Veredas',
      autor: 'Guimarães Rosa',
      genero: 'Romance',
      exemplares: 4,
      disponivel: 2,
      status: 'ativo',
    },
    {
      id: 4,
      titulo: 'Capitães da Areia',
      autor: 'Jorge Amado',
      genero: 'Romance',
      exemplares: 6,
      disponivel: 4,
      status: 'ativo',
    },
  ]);

  const filteredLivros = livros.filter(
    (livro) =>
      livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livro.autor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Catálogo de Livros</h1>
            <p className="text-muted-foreground">Gerenciar livros e exemplares da biblioteca</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Livro
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou autor..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Livros Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Título</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Autor</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Gênero</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Exemplares</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Disponível</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLivros.map((livro) => (
                    <tr key={livro.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-4 px-4 text-foreground font-medium">{livro.titulo}</td>
                      <td className="py-4 px-4 text-muted-foreground">{livro.autor}</td>
                      <td className="py-4 px-4 text-muted-foreground">{livro.genero}</td>
                      <td className="py-4 px-4 text-center text-foreground">{livro.exemplares}</td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {livro.disponivel}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {livro.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-secondary rounded-md transition-colors">
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-secondary rounded-md transition-colors">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
