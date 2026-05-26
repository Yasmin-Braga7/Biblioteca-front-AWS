import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cargo: string;
  status: 'ativo' | 'inativo';
  dataRegistro: string;
}

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios] = useState<Usuario[]>([
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      cargo: 'Administrador',
      status: 'ativo',
      dataRegistro: '2026-01-15',
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@example.com',
      telefone: '(11) 98765-4322',
      cpf: '123.456.789-01',
      cargo: 'Bibliotecário',
      status: 'ativo',
      dataRegistro: '2026-02-10',
    },
    {
      id: 3,
      nome: 'Pedro Costa',
      email: 'pedro@example.com',
      telefone: '(11) 98765-4323',
      cpf: '123.456.789-02',
      cargo: 'Usuário',
      status: 'ativo',
      dataRegistro: '2026-03-05',
    },
    {
      id: 4,
      nome: 'Ana Oliveira',
      email: 'ana@example.com',
      telefone: '(11) 98765-4324',
      cpf: '123.456.789-03',
      cargo: 'Usuário',
      status: 'inativo',
      dataRegistro: '2026-01-20',
    },
  ]);

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cpf.includes(searchTerm)
  );

  const cargoColors: Record<string, string> = {
    Administrador: 'bg-purple-50 text-purple-700 border-purple-200',
    Bibliotecário: 'bg-blue-50 text-blue-700 border-blue-200',
    Usuário: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Usuários</h1>
            <p className="text-muted-foreground">Gerenciar usuários do sistema</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{usuarios.length}</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {usuarios.filter((u) => u.status === 'ativo').length}
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {usuarios.filter((u) => u.status === 'inativo').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Telefone</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Cargo</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Registro</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-4 px-4 text-foreground font-medium">{usuario.nome}</td>
                      <td className="py-4 px-4 text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {usuario.email}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {usuario.telefone}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={cargoColors[usuario.cargo] || 'bg-gray-50 text-gray-700 border-gray-200'}
                        >
                          {usuario.cargo}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={
                            usuario.status === 'ativo'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }
                        >
                          {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">{usuario.dataRegistro}</td>
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
