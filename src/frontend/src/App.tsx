import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { RotaProtegida, RotaPublica } from "./components/RotaProtegida";
import { Toaster } from "./components/Toast";
import { AuthProvider } from "./contexts/AuthContext";
import { LayoutAluno } from "./layouts/LayoutAluno";
import { LayoutCantina } from "./layouts/LayoutCantina";
import { PERFIS_ADMIN, PERFIS_CANTINA, PERFIS_GESTAO } from "./lib/perfis";
import { AcompanharPedido } from "./pages/AcompanharPedido";
import { Cadastro } from "./pages/Cadastro";
import { Cardapio } from "./pages/Cardapio";
import { Componentes } from "./pages/Componentes";
import { Fila } from "./pages/Fila";
import { Login } from "./pages/Login";
import { MeusPedidos } from "./pages/MeusPedidos";
import { NaoEncontrada } from "./pages/NaoEncontrada";
import { Perfil } from "./pages/Perfil";
import { Produtos } from "./pages/Produtos";
import { Usuarios } from "./pages/Usuarios";
import { Vendas } from "./pages/Vendas";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
          {import.meta.env.DEV && <Route path="/componentes" element={<Componentes />} />}

          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  );
}
