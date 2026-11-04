import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { RotaProtegida, RotaPublica } from "./components/RotaProtegida";
import { Toaster } from "./components/Toast";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { LayoutAluno } from "./layouts/LayoutAluno";
import { LayoutCantina } from "./layouts/LayoutCantina";
import { PERFIS_ADMIN, PERFIS_CANTINA, PERFIS_GESTAO } from "./lib/perfis";

/* Cada tela vira um pedaço separado: o aluno não baixa as telas da cantina e vice-versa. */
const AcompanharPedido = lazy(() => import("./pages/AcompanharPedido").then((m) => ({ default: m.AcompanharPedido })));
const Cadastro = lazy(() => import("./pages/Cadastro").then((m) => ({ default: m.Cadastro })));
const Cardapio = lazy(() => import("./pages/Cardapio").then((m) => ({ default: m.Cardapio })));
// Vitrine de componentes: só existe em desenvolvimento (nem entra no build final).
const Componentes = import.meta.env.DEV
  ? lazy(() => import("./pages/Componentes").then((m) => ({ default: m.Componentes })))
  : null;
const Fila = lazy(() => import("./pages/Fila").then((m) => ({ default: m.Fila })));
const Login = lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })));
const MeusPedidos = lazy(() => import("./pages/MeusPedidos").then((m) => ({ default: m.MeusPedidos })));
const NaoEncontrada = lazy(() => import("./pages/NaoEncontrada").then((m) => ({ default: m.NaoEncontrada })));
const Perfil = lazy(() => import("./pages/Perfil").then((m) => ({ default: m.Perfil })));
const Produtos = lazy(() => import("./pages/Produtos").then((m) => ({ default: m.Produtos })));
const Usuarios = lazy(() => import("./pages/Usuarios").then((m) => ({ default: m.Usuarios })));
const Vendas = lazy(() => import("./pages/Vendas").then((m) => ({ default: m.Vendas })));

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <Suspense fallback={null}>
        <Routes>
          <Route element={<RotaPublica />}>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
          </Route>

          <Route element={<RotaProtegida perfis={["ALUNO"]} />}>
            <Route element={<LayoutAluno />}>
              <Route index element={<Cardapio />} />
              <Route path="/pedidos" element={<MeusPedidos />} />
              <Route path="/pedidos/:id" element={<AcompanharPedido />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Route>

          <Route element={<RotaProtegida perfis={PERFIS_CANTINA} />}>
            <Route element={<LayoutCantina />}>
              <Route path="/cantina">
                <Route index element={<Navigate to="fila" replace />} />
                <Route path="fila" element={<Fila />} />
                <Route element={<RotaProtegida perfis={PERFIS_GESTAO} />}>
                  <Route path="produtos" element={<Produtos />} />
                  <Route path="vendas" element={<Vendas />} />
                </Route>
                <Route element={<RotaProtegida perfis={PERFIS_ADMIN} />}>
                  <Route path="usuarios" element={<Usuarios />} />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* Vitrine de componentes: só existe em desenvolvimento. */}
          {Componentes && <Route path="/componentes" element={<Componentes />} />}

          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
        </Suspense>
        </CartProvider>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  );
}
