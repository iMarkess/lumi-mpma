/*
  Transição de entrada só em CSS. A versão com framer-motion renderizava o
  conteúdo com opacity: 0 no HTML do servidor e dependia do JS para aparecer:
  em celular lento (ou se um script falhasse) a página ficava em branco.
*/
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
