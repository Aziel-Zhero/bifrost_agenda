
"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Eye, EyeOff } from "lucide-react";

// This is a helper function that will be used to generate the cropped image.
function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  rotation = 0
): Promise<string> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return Promise.reject(new Error('Could not get canvas context'));
  }

  const newX = crop.x * scaleX;
  const newY = crop.y * scaleY;
  const newWidth = crop.width * scaleX;
  const newHeight = crop.height * scaleY;

  ctx.save();
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-newWidth / 2, -newHeight / 2);
  ctx.drawImage(
    image,
    newX,
    newY,
    newWidth,
    newHeight,
    0,
    0,
    newWidth,
    newHeight
  );
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
         resolve('');
         return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}


export default function PerfilPage() {
  const [imgSrc, setImgSrc] = useState('');
  const [profilePic, setProfilePic] = useState('https://picsum.photos/128/128');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [isCropModalOpen, setCropModalOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(String(reader.result)));
      reader.readAsDataURL(e.target.files[0]);
      setCropModalOpen(true);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect || 1, width, height),
      width,
      height
    );
    setCrop(newCrop);
    setCompletedCrop(newCrop);
    setScale(1);
    setRotation(0);
  }

  async function handleCropSave() {
    if (completedCrop && imgRef.current) {
        const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop, rotation);
        setProfilePic(croppedImageUrl);
        setCropModalOpen(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-8 mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e de acesso.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>
              Esses são os seus dados de identificação na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profilePic} alt="Admin" data-ai-hint="person" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div>
                <Input type="file" ref={fileInputRef} onChange={onSelectFile} className="hidden" accept="image/*" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Alterar Foto</Button>
                <p className="text-xs text-muted-foreground mt-2">
                    Recomendamos imagens 1:1 (quadradas).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input id="displayName" defaultValue="Admin Master" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@example.com" disabled />
            </div>
            
             <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium">Alterar Senha</h4>
                <div className="space-y-2 relative">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} placeholder="Digite sua senha atual" />
                     <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowCurrentPassword(prev => !prev)}>
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                 <div className="space-y-2 relative">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" type={showNewPassword ? "text" : "password"} placeholder="Digite a nova senha" />
                     <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowNewPassword(prev => !prev)}>
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                 <div className="space-y-2 relative">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirme a nova senha" />
                     <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="flex justify-end">
              <Button>Salvar Alterações</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Editar Imagem do Perfil</DialogTitle>
            </DialogHeader>
            {imgSrc && (
                <div className="space-y-4">
                    <div className="h-96 w-full overflow-hidden rounded-md flex items-center justify-center bg-muted">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        circularCrop
                      >
                        <img
                          ref={imgRef}
                          alt="Crop me"
                          src={imgSrc}
                          style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
                          onLoad={onImageLoad}
                          className="max-h-96"
                        />
                      </ReactCrop>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="scale">Zoom</Label>
                        <Slider
                            id="scale"
                            defaultValue={[1]}
                            min={1}
                            max={3}
                            step={0.1}
                            value={[scale]}
                            onValueChange={(value) => setScale(value[0])}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="rotation">Girar</Label>
                        <Slider
                            id="rotation"
                            defaultValue={[0]}
                            min={-180}
                            max={180}
                            step={1}
                            value={[rotation]}
                            onValueChange={(value) => setRotation(value[0])}
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleCropSave}>Salvar Foto</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
