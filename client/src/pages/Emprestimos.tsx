import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Emprestimo {
  id: number;
  usuario: string;
  livro: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  status: 'ativo' | 'atrasado' | 'devolvido';
}

export default function Emprestimos() {
  const [emprestimos] = useState<Emprestimo[]>([
    {
      id: 1,
      usuario: 'João Silva',
      livro: 'Dom Casmurro',
      dataEmprestimo: '2026-05-01',
      dataDevolucao: '2026-05-15',
      status: 'ativo',
    },
    {
      id: 2,
      usuario: 'Maria Santos',
      livro: 'O Cortiço',
      dataEmprestimo: '2026-04-20',
      dataDevolucao: '2026-05-04',
      status: 'atrasado',
    },
    {
      id: 3,
      usuario: 'Pedro Costa',
      livro: 'Grande Sertão: Veredas',
      dataEmprestimo: '2026-05-10',
      dataDevolucao: '2026-05-24',
      status: 'ativo',
    },
    {
      id: 4,
      usuario: 'Ana Oliveira',
      livro: 'Capitães da Areia',
      dataEmprestimo: '2026-04-15',
      dataDevolucao: '2026-04-29',
      status: 'devolvido',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'atrasado':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'devolvido':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'atrasado':
        return 'Atrasado';
      case 'devolvido':
        return 'Devolvido';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Empréstimos</h1>
            <p className="text-muted-foreground">Gerenciar empréstimos e devoluções de livros</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Empréstimo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Empréstimos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">24</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Atrasados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">3</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Multas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">R$ 45,00</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Histórico de Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="ativos">Ativos</TabsTrigger>
                <TabsTrigger value="atrasados">Atrasados</TabsTrigger>
              </TabsList>

              <TabsContent value="todos" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Usuário</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Livro</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Empréstimo</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Devolução</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emprestimos.map((emp) => (
                        <tr key={emp.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="py-4 px-4 text-foreground font-medium">{emp.usuario}</td>
                          <td className="py-4 px-4 text-muted-foreground">{emp.livro}</td>
                          <td className="py-4 px-4 text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {emp.dataEmprestimo}
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">{emp.dataDevolucao}</td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className={getStatusColor(emp.status)}>
                              {emp.status === 'atrasado' && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {getStatusLabel(emp.status)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="ativos" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Usuário</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Livro</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Devolução</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emprestimos
                        .filter((e) => e.status === 'ativo')
                        .map((emp) => (
                          <tr key={emp.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                            <td className="py-4 px-4 text-foreground font-medium">{emp.usuario}</td>
                            <td className="py-4 px-4 text-muted-foreground">{emp.livro}</td>
                            <td className="py-4 px-4 text-muted-foreground">{emp.dataDevolucao}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="atrasados" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Usuário</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Livro</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Devolução</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Multa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emprestimos
                        .filter((e) => e.status === 'atrasado')
                        .map((emp) => (
                          <tr key={emp.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                            <td className="py-4 px-4 text-foreground font-medium">{emp.usuario}</td>
                            <td className="py-4 px-4 text-muted-foreground">{emp.livro}</td>
                            <td className="py-4 px-4 text-red-600 font-medium">{emp.dataDevolucao}</td>
                            <td className="py-4 px-4 text-red-600 font-medium">R$ 15,00</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
