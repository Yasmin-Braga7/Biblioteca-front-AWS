import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Reserva {
  id: number;
  usuario: string;
  livro: string;
  dataReserva: string;
  posicaoFila: number;
  status: 'pendente' | 'confirmada' | 'cancelada';
}

export default function Reservas() {
  const [reservas] = useState<Reserva[]>([
    {
      id: 1,
      usuario: 'João Silva',
      livro: 'Dom Casmurro',
      dataReserva: '2026-05-20',
      posicaoFila: 1,
      status: 'confirmada',
    },
    {
      id: 2,
      usuario: 'Maria Santos',
      livro: 'O Cortiço',
      dataReserva: '2026-05-18',
      posicaoFila: 2,
      status: 'pendente',
    },
    {
      id: 3,
      usuario: 'Pedro Costa',
      livro: 'Grande Sertão: Veredas',
      dataReserva: '2026-05-15',
      posicaoFila: 1,
      status: 'confirmada',
    },
    {
      id: 4,
      usuario: 'Ana Oliveira',
      livro: 'Capitães da Areia',
      dataReserva: '2026-05-22',
      posicaoFila: 3,
      status: 'pendente',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pendente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelada':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendente':
        return 'Pendente';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const stats = [
    { label: 'Total de Reservas', value: '12', icon: Clock },
    { label: 'Confirmadas', value: '8', icon: CheckCircle },
    { label: 'Pendentes', value: '4', icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Reservas</h1>
            <p className="text-muted-foreground">Gerenciar reservas de livros</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Reserva
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reservas Table */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Lista de Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Usuário</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Livro</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Posição na Fila</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Data da Reserva</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((reserva) => (
                    <tr key={reserva.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-4 px-4 text-foreground font-medium">{reserva.usuario}</td>
                      <td className="py-4 px-4 text-muted-foreground">{reserva.livro}</td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          #{reserva.posicaoFila}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{reserva.dataReserva}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={getStatusColor(reserva.status)}>
                          {getStatusLabel(reserva.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="outline" size="sm" className="text-xs">
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Queue Info */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Informações sobre Filas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/50 rounded-md border border-border">
                <p className="text-sm font-medium text-foreground mb-2">Livro com Maior Fila</p>
                <p className="text-lg font-bold text-foreground">Dom Casmurro</p>
                <p className="text-xs text-muted-foreground mt-1">5 pessoas na fila</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-md border border-border">
                <p className="text-sm font-medium text-foreground mb-2">Tempo Médio de Espera</p>
                <p className="text-lg font-bold text-foreground">7 dias</p>
                <p className="text-xs text-muted-foreground mt-1">Baseado em empréstimos anteriores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
