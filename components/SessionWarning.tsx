"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";

export default function SessionWarning() {
  const { data: session, status } = useSession();
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(120); // 2 minutos
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Configuración: 10 minutos de inactividad total, advertencia 2 minutos antes
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos
  const WARNING_TIME = 2 * 60 * 1000; // 2 minutos

  // Reinicia el temporizador cuando hay actividad del usuario
  const resetInactivityTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Detectamos cualquier actividad del usuario para resetear el timer
  useEffect(() => {
    if (status !== "authenticated") return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Agregamos listeners para cada evento
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Limpiamos los listeners al desmontar
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [status, resetInactivityTimer]);

  // Verificamos la inactividad cada segundo
  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const timeUntilLogout = INACTIVITY_TIMEOUT - timeSinceLastActivity;

      // Mostramos advertencia si quedan menos de 2 minutos
      if (timeUntilLogout <= WARNING_TIME && timeUntilLogout > 0) {
        setShowWarning(true);
        setTimeRemaining(Math.floor(timeUntilLogout / 1000));
      } else {
        setShowWarning(false);
      }

      // Cerramos sesión si se acabó el tiempo de inactividad
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        signOut({ 
          callbackUrl: '/acceso-usuarios',
          redirect: true 
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, lastActivity, INACTIVITY_TIMEOUT, WARNING_TIME]);

  // No mostramos nada si no hay advertencia o no hay sesión
  if (!showWarning || status !== "authenticated") {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icono de alerta */}
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          
          {/* Contenido del aviso */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              Sesión inactiva
            </p>
            <p className="text-xs text-red-600 mt-1">
              Tiempo restante: <span className="font-mono font-bold text-base">{minutes}:{seconds.toString().padStart(2, "0")}</span>
            </p>
            <p className="text-xs text-red-700 mt-2">
              Por inactividad, tu sesión se cerrará automáticamente.
            </p>
            {/* Botón para mantener la sesión activa */}
            <button
              onClick={resetInactivityTimer}
              className="mt-3 w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
            >
              Continuar con mi sesión
            </button>
          </div>
          
          {/* Botón para cerrar el aviso temporalmente */}
          <button
            onClick={() => setShowWarning(false)}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
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
    </div>
  );
}