import { notFound } from 'next/navigation';
import ComplaintForm, { type Step } from '@/components/ComplaintForm';
import Navbar from '@/components/Navbar';
import styles from './ComplaintPage.module.css';

type Category = 'child' | 'elderly' | 'env';

/* Mesmas perguntas do app (mobile/lib/.../complaint_form_screen.dart). */
const STEPS: Record<Category, Step[]> = {
  child: [
    { title: 'Sobre quem precisa de ajuda', question: 'Quem é a criança ou adolescente que precisa de ajuda?', help: 'Se souber, informe nome ou apelido. Pode deixar em branco.', type: 'text', field: 'victim_name', optional: true },
    { title: 'Como você se sente?', question: 'Como você está se sentindo agora?', type: 'emoji', field: 'emotions' },
    { title: 'Idade aproximada', question: 'Você sabe a idade da criança ou adolescente?', type: 'radio', options: ['Não sei', '0 a 5 anos', '6 a 10 anos', '11 a 14 anos', '15 a 17 anos'], field: 'victim_age' },
    { title: 'O que está acontecendo', question: 'Conte, com suas palavras, o que está acontecendo.', help: 'Onde, quando, com que frequência. Não precisa ter provas.', type: 'textarea', field: 'description' },
    { title: 'Situação de risco', question: 'A criança ou adolescente está em perigo neste momento?', type: 'radio', options: ['Sim', 'Não', 'Não sei'], field: 'is_urgent' },
  ],
  elderly: [
    { title: 'Sobre quem precisa de ajuda', question: 'Quem é a pessoa que precisa de ajuda?', help: 'Se souber, informe nome ou apelido. Pode deixar em branco.', type: 'text', field: 'victim_name', optional: true },
    { title: 'Perfil da pessoa', question: 'A situação envolve:', type: 'radio', options: ['Pessoa idosa', 'Pessoa com deficiência', 'Ambos', 'Não sei informar'], field: 'victim_type' },
    { title: 'O que está acontecendo', question: 'Conte, com suas palavras, o que está acontecendo.', help: 'Onde, quando, com que frequência. Não precisa ter provas.', type: 'textarea', field: 'description' },
    { title: 'Situação de risco', question: 'A pessoa está em perigo neste momento?', type: 'radio', options: ['Sim', 'Não', 'Não sei'], field: 'is_urgent' },
  ],
  env: [
    { title: 'Descrição do fato', question: 'Conte, com suas palavras, o que está acontecendo.', help: 'O que você viu, quando e com que frequência.', type: 'textarea', field: 'description' },
    { title: 'Local da ocorrência', question: 'Onde isso está acontecendo?', help: 'Endereço, bairro, cidade ou um ponto de referência.', type: 'text', field: 'location' },
    { title: 'Situação de risco', question: 'Há risco imediato à saúde de pessoas, animais ou ao meio ambiente?', type: 'radio', options: ['Sim', 'Não', 'Não sei'], field: 'is_urgent' },
  ],
};

const NAMES: Record<Category, string> = {
  child: 'Criança e adolescente',
  elderly: 'Idosos e pessoas com deficiência',
  env: 'Meio ambiente',
};

export function generateStaticParams() {
  return (Object.keys(STEPS) as Category[]).map((type) => ({ type }));
}

export default async function DenunciarPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!(type in STEPS)) notFound();
  const category = type as Category;

  return (
    <main className={`${styles.main} night`}>
      <Navbar />
      <div className={`${styles.content} container`}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Nova denúncia</p>
          <h1>{NAMES[category]}</h1>
          <p>Responda no seu tempo. Você pode ficar anônimo até o fim.</p>
        </header>

        <ComplaintForm type={category} categoryName={NAMES[category]} steps={STEPS[category]} />
      </div>
    </main>
  );
}
