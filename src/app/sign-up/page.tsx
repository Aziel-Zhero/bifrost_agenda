
import SignUpForm from "./components/sign-up-form";
import { Logo } from "@/components/logo";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default function SignUpPage() {

    return (
        <main className="flex min-h-screen w-full items-center justify-center p-4 bg-muted">
            <Card className="w-full max-w-sm">
                <CardHeader className="items-center text-center">
                    <Logo />
                    <CardTitle className="pt-4 text-2xl font-bold">
                        Bifrost Central
                    </CardTitle>
                    <CardDescription>Finalize seu cadastro definindo uma senha.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SignUpForm />
                </CardContent>
            </Card>
        </main>
    );
}
