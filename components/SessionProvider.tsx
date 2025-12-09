"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function SessionWarning() {
  const { data: session, status } = useSession();
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(120); // 2 minutos en segundos

  useEffect(() => {
    // No mostramos nada si no hay sesión activa
    if (status !== "authenticated") {
      setShowWarning(false);
      return;
    }

    // Configuración: la sesión dura 10 minutos total
    const SESSION_DURATION = 10 * 60 * 1000; // 10 minutos
    const WARNING_TIME = 8 * 60 * 1000; // Mostramos el aviso a los 8 minutos

    const loginTime = Date.now();

    // Timer que muestra la advertencia 2 minutos antes de expirar
    const warningTimer = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(120); // 2 minutos restantes
    }, WARNING_TIME);

    // Timer que cierra la sesión automáticamente a los 10 minutos
    const logoutTimer = setTimeout(() => {
      signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    }, SESSION_DURATION);

    // Limpiamos los timers cuando el componente se desmonta
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };
  }, [status]);

  // Contador regresivo que actualiza cada segundo
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  // No renderizamos nada si no hay que mostrar advertencia
  if (!showWarning || status !== "authenticated") {
    return null;
  }

  // Calculamos minutos y segundos para mostrar
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 max-w-md animate-pulse">
      <div className="flex items-start gap-3">
        {/* Icono de advertencia */}
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        {/* Contenido del mensaje */}
        <div className="flex-1">
          <p className="text-sm font-bold">⚠️ Tu sesión está por expirar</p>
          <p className="text-lg font-mono font-bold mt-2">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
          <p className="text-xs mt-2">
            Por seguridad, tu sesión se cerrará automáticamente. Guarda tu trabajo.
          </p>
          {/* Botón para renovar la sesión */}
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors"
          >
            Renovar sesión ahora
          </button>
        </div>
        
        {/* Botón para cerrar la advertencia */}
        <button
          onClick={() => setShowWarning(false)}
          className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
          aria-label="Cerrar advertencia"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}