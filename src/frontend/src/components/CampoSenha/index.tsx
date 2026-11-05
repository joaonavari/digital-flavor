import { useState } from "react";
import { BotaoIcone } from "../Button";
import { TextField, type TextFieldInputProps } from "../TextField";

type Props = Omit<TextFieldInputProps, "type" | "acessorio" | "multilinha">;

const Olho = ({ aberto }: { aberto: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
    {!aberto && <path d="M4 4l16 16" />}
  </svg>
);

/** Campo de senha com botão para mostrar ou esconder o que foi digitado. */
export function CampoSenha(props: Props) {
  const [visivel, setVisivel] = useState(false);
  return (
    <TextField
      {...props}
      type={visivel ? "text" : "password"}
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      acessorio={
        <BotaoIcone
          rotulo={visivel ? "Esconder senha" : "Mostrar senha"}
          aria-pressed={visivel}
          onClick={() => setVisivel((v) => !v)}
        >
          <Olho aberto={!visivel} />
        </BotaoIcone>
      }
    />
  );
}
