
"use client";

import { useState } from "react";
import { PlusCircle, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { services as mockServices, serviceIcons } from "@/lib/mock-data";
import type { Service } from "@/types";
import { cn } from "@/lib/utils";


export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [formData, setFormData] = useState<Partial<Service>>({});

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    setFormData(service);
    setFormOpen(true);
  };
  
  const handleDeleteClick = (service: Service) => {
    setSelectedService(service);
    setDeleteAlertOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService) {
      setServices(services.map(s => s.id === selectedService.id ? { ...s, ...formData } as Service : s));
    } else {
      const newService: Service = {
        id: `serv-${Date.now()}`,
        name: formData.name || "",
        duration: formData.duration || "",
        price: formData.price || 0,
        icon: formData.icon,
      };
      setServices([...services, newService]);
    }
    closeForm();
  };
  
  const confirmDelete = () => {
    if (selectedService) {
      setServices(services.filter(s => s.id !== selectedService.id));
    }
    setDeleteAlertOpen(false);
    setSelectedService(null);
  }

  const closeForm = () => {
    setFormOpen(false);
    setSelectedService(null);
    setFormData({});
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = serviceIcons[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5 text-muted-foreground" /> : null;
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Serviços</h1>
            <p className="text-muted-foreground">
              Adicione, edite ou remova os serviços oferecidos.
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setSelectedService(null); setFormData({}); setFormOpen(true);}}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedService ? "Editar" : "Adicionar"} Serviço</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço</Label>
                  <Input id="name" placeholder="Ex: Maquiagem Social" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="icon">Ícone</Label>
                    <Select value={formData.icon} onValueChange={value => setFormData({...formData, icon: value})}>
                        <SelectTrigger id="icon">
                            <SelectValue placeholder="Selecione um ícone" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(serviceIcons).map(iconName => {
                                const Icon = serviceIcons[iconName];
                                return (
                                    <SelectItem key={iconName} value={iconName}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-5 w-5" />
                                            <span>{iconName}</span>
                                        </div>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração</Label>
                    <Input id="duration" placeholder="Ex: 1 hora" value={formData.duration || ''} onChange={e => setFormData({...formData, duration: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input id="price" type="number" placeholder="Ex: 200.00" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required/>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3 font-medium">
                        {renderIcon(service.icon)}
                        {service.name}
                      </div>
                    </TableCell>
                    <TableCell>{service.duration}</TableCell>
                    <TableCell>{`R$ ${service.price.toFixed(2)}`}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(service)}>
                            <Edit className="mr-2 h-4 w-4"/>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(service)}>
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <DialogContent>
               <DialogHeader>
                    <DialogTitle>Você tem certeza?</DialogTitle>
                    <CardDescription>
                       Esta ação não pode ser desfeita. Isso excluirá permanentemente o serviço
                       <span className="font-semibold"> {selectedService?.name}</span>.
                    </CardDescription>
               </DialogHeader>
               <DialogFooter>
                    <DialogClose asChild>
                         <Button variant="outline" onClick={() => setDeleteAlertOpen(false)}>Cancelar</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={confirmDelete}>Confirmar Exclusão</Button>
               </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
