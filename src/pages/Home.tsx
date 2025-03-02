import { APITester } from "@/APITester";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logo from "@/logo.svg";
import reactLogo from "@/react.svg";
import { useAuth } from "@/components/auth/AuthProvider";
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
    openAuthModal: (mode: 'login' | 'register') => void;
}

export default function Home({ openAuthModal }: HomeProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    return (
        <div className="container mx-auto p-8 text-center">
            <div className="flex justify-center items-center gap-8 mb-8">
                <img
                    src={logo}
                    alt="Bun Logo"
                    className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
                />
                <img
                    src={reactLogo}
                    alt="React Logo"
                    className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] [animation:spin_20s_linear_infinite]"
                />
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-muted mb-8">
                <CardContent className="pt-6">
                    <h1 className="text-5xl font-bold my-4 leading-tight">Welcome to Rivena</h1>
                    <p className="mb-6">An advanced voice interface powered by AI</p>

                    {user ? (
                        <Button size="lg" onClick={() => navigate('/voice-flow')}>
                            Launch Voice Flow UI
                        </Button>
                    ) : (
                        <Button size="lg" onClick={() => openAuthModal('login')}>
                            Sign In to Continue
                        </Button>
                    )}
                </CardContent>
            </Card>

            <APITester />
        </div>
    );
}
