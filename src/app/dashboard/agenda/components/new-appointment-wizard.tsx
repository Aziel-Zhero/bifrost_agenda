
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { clients, services } from "@/lib/mock-data";
import { ptBR } from 'date-fns/locale';
import { User, Calendar as CalendarIcon, Clock, Tag, Pencil } from "lucide-react";

const steps = [
  { id: 1, name: "Tipo de Cliente" },
  { id: 2, name: "Detalhes do Cliente" },
  { id: 3, name: "Serviço" },
  { id: 4, name: "Data do Agendamento" },
  { id: 5, name: "Horário" },
  { id: 6, name: "Observações" },
  { id: 7, name: "Confirmação" },
];

const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

type FormData = {
  clientType: 'new' | 'existing';
  newClientName: string;
  newClientWhatsapp: string;
  existingClientId: string;
  serviceId: string;
  date: Date | undefined;
  time: string;
  notes: string;
};

interface NewAppointmentWizardProps {
    onFinish: (details: {clientName: string; date: string; time: string; serviceName: string;}) => void;
}


export default function NewAppointmentWizard({ onFinish }: NewAppointmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    clientType: 'existing',
    date: new Date(),
    newClientName: '',
    newClientWhatsapp: '',
    existingClientId: '',
    serviceId: '',
    time: '',
    notes: '',
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const isNextDisabled = () => {
    const stepId = steps[currentStep].id;
    if (stepId === 2) {
      if (formData.clientType === 'new') {
        return !formData.newClientName || !formData.newClientWhatsapp || formData.newClientWhatsapp.replace(/\D/g, '').length < 11;
      }
      return !formData.existingClientId;
    }
    if (stepId === 3) return !formData.serviceId;
    if (stepId === 4) return !formData.date;
    if (stepId === 5) return !formData.time;
    return false;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
       setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {
    let finalValue = value;
    if (field === 'newClientWhatsapp') {
      const onlyNums = value.replace(/\D/g, '');
      let masked = '';
      if (onlyNums.length > 0) {
        masked = `(${onlyNums.substring(0,2)}`;
      }
      if (onlyNums.length > 2) {
        masked += `) ${onlyNums.substring(2,7)}`;
      }
      if (onlyNums.length > 7) {
        masked += `-${onlyNums.substring(7,11)}`;
      }
      finalValue = masked;
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));
  };
  
  const getSummary = () => {
      const clientName = formData.clientType === 'new' 
          ? formData.newClientName 
          : clients.find(c => c.id === formData.existingClientId)?.name;
      const serviceName = services.find(s => s.id === formData.serviceId)?.name;
      const date = formData.date?.toLocaleDateString('pt-BR');
      const time = formData.time;

      return { clientName, serviceName, date, time };
  }

  const handleSubmit = () => {
    const summary = getSummary();
    if (formData.clientType === 'new' && (!formData.newClientName || !formData.newClientWhatsapp)) {
        // Simple validation, should be improved with a toast or inline message
        console.error("New client details are missing");
        return;
    }

    if(summary.clientName && summary.date && summary.time && summary.serviceName) {
        onFinish({
            clientName: summary.clientName,
            date: summary.date,
            time: summary.time,
            serviceName: summary.serviceName,
        });
    }
  };

  const currentStepInfo = steps[currentStep];

  return (
    <div className="space-y-6 p-2">
      <Progress value={progress} className="w-full" />
      <h3 className="text-lg font-medium text-center">
        {currentStepInfo.name}
      </h3>
      <div className="overflow-hidden relative h-80">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full absolute"
          >
            {/* Step 1: Client Type */}
            {currentStepInfo.id === 1 && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                 <p className="font-medium">É um novo cliente ou já é cliente?</p>
                <RadioGroup
                  value={formData.clientType}
                  onValueChange={(value: 'new' | 'existing') => {
                      handleFieldChange("clientType", value);
                      // Reset other fields when changing type
                      setFormData(prev => ({ 
                        ...prev,
                        clientType: value, 
                        newClientName: '',
                        newClientWhatsapp: '',
                        existingClientId: '',
                      }));
                  }}
                  className="flex gap-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="r1" />
                    <Label htmlFor="r1">Já é cliente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="r2" />
                    <Label htmlFor="r2">Novo Cliente</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {/* Step 2: Client Details */}
            {currentStepInfo.id === 2 && (
              <div className="space-y-4">
                {formData.clientType === 'new' ? (
                  <>
                    <p className="text-sm text-center text-muted-foreground mb-4">
                        Precisamos de alguns dados para o cadastro.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="newClientName">Nome do Cliente</Label>
                      <Input id="newClientName" placeholder="Nome completo" value={formData.newClientName} onChange={e => handleFieldChange('newClientName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newClientWhatsapp">WhatsApp</Label>
                      <Input 
                        id="newClientWhatsapp" 
                        placeholder="(99) 99999-9999" 
                        value={formData.newClientWhatsapp} 
                        onChange={e => handleFieldChange('newClientWhatsapp', e.target.value)} 
                        maxLength={15}
                      />
                    </div>
                  </>
                ) : (
                  <>
                     <p className="text-sm text-center text-muted-foreground mb-4">
                       Selecione o cliente da sua lista.
                    </p>
                    <Select onValueChange={(value) => handleFieldChange('existingClientId', value)} value={formData.existingClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.whatsapp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            )}
             
            {/* Step 3: Service */}
            {currentStepInfo.id === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Qual serviço será realizado?
                </p>
                <Select onValueChange={(value) => handleFieldChange('serviceId', value)} value={formData.serviceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 4: Date */}
            {currentStepInfo.id === 4 && (
                <div className="flex flex-col items-center justify-center">
                     <p className="text-sm text-center text-muted-foreground mb-2">Para qual dia deseja agendar?</p>
                     <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => handleFieldChange('date', date)}
                        locale={ptBR}
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                     />
                </div>
            )}

            {/* Step 5: Time */}
            {currentStepInfo.id === 5 && (
                 <div className="flex flex-col items-center justify-center h-full">
                     <p className="text-sm text-center text-muted-foreground mb-4">Agora, escolha um horário.</p>
                    <div className="grid grid-cols-3 gap-2">
                        {availableTimes.map(time => (
                            <Button 
                                key={time} 
                                variant={formData.time === time ? 'default' : 'outline'}
                                onClick={() => handleFieldChange('time', time)}
                            >
                                {time}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Step 6: Notes */}
            {currentStepInfo.id === 6 && (
                <div className="space-y-4">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                       Deseja adicionar alguma observação? (Opcional)
                    </p>
                    <Textarea 
                        placeholder="Ex: Cliente tem preferência por café..."
                        onChange={e => handleFieldChange('notes', e.target.value)}
                        value={formData.notes}
                    />
                </div>
            )}
            
            {/* Step 7: Confirmation */}
            {currentStepInfo.id === 7 && (
                <div className="space-y-4 text-center">
                    <h4 className="font-semibold">Confirme os Detalhes</h4>
                     <div className="text-left bg-muted p-4 rounded-md space-y-3">
                        <div className="flex items-center gap-2">
                           <User className="text-muted-foreground h-5 w-5" /> 
                           <p><strong>Cliente:</strong> {getSummary().clientName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <Tag className="text-muted-foreground h-5 w-5" />
                           <p><strong>Serviço:</strong> {getSummary().serviceName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <CalendarIcon className="text-muted-foreground h-5 w-5" />
                           <p><strong>Data:</strong> {getSummary().date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-5 w-5" />
                           <p><strong>Hora:</strong> {getSummary().time}</p>
                        </div>
                        {formData.notes && (
                             <div className="flex items-start gap-2">
                                <Pencil className="text-muted-foreground mt-1 h-5 w-5" />
                                <p><strong>Observações:</strong> {formData.notes}</p>
                             </div>
                        )}
                    </div>
                </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
          Voltar
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} disabled={isNextDisabled()}>Próximo</Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Finalizar Agendamento</Button>
        )}
      </div>
    </div>
  );
}
