import ComplaintForm from '@/components/ComplaintForm';
import Navbar from '@/components/Navbar';
import styles from './ComplaintPage.module.css';

const stepsByCategory: any = {
  child: [
    { title: 'Sobre quem precisa de ajuda', question: 'Quem é a criança ou adolescente que precisa de ajuda? (se souber, informe nome ou apelido)', type: 'text', field: 'victim_name' },
    { title: 'Como você se sente?', question: 'Queremos saber: como você está se sentindo agora?', type: 'radio', field: 'emotions' },
    { title: 'Idade aproximada', question: 'Você sabe a idade da criança ou adolescente?', type: 'radio', options: ['Não sei', '0 a 5 anos', '6 a 10 anos', '11 a 14 anos', '15 a 17 anos'], field: 'victim_age' },
    { title: 'O que está acontecendo', question: 'Você pode contar, com suas palavras, o que está acontecendo?', type: 'textarea', field: 'description' },
    { title: 'Situação de risco atual', question: 'A criança ou adolescente está em perigo neste momento?', type: 'radio', options: ['Sim', 'Não', 'Não sei'], field: 'is_urgent' },
  ],
  elderly: [
    { title: 'Sobre quem precisa de ajuda', question: 'Quem é a pessoa que precisa de ajuda? (se souber, informe nome ou apelido)', type: 'text', field: 'victim_name' },
    { title: 'Perfil da pessoa', question: 'A situação envolve:', type: 'radio', options: ['Pessoa idosa', 'Pessoa com deficiência', 'Ambos', 'Não sei informar'], field: 'victim_type' },
    { title: 'O que está acontecendo', question: 'Você pode descrever, com suas palavras, o que está acontecendo?', type: 'textarea', field: 'description' },
    { title: 'Situação de risco atual', question: 'A pessoa está em perigo neste momento?', type: 'radio', options: ['Sim', 'Não', 'Não sei'], field: 'is_urgent' },
  ],
  env: [
    { title: 'Descrição do fato', question: 'Você pode descrever, com suas palavras, o que está acontecendo?', type: 'textarea', field: 'description' },
    { title: 'Local da ocorrência', question: 'Onde isso está acontecendo? (informe endereço ou ponto de referência)', type: 'text', field: 'location' },
    { title: 'Situação de risco', question: 'Há risco imediato à saúde das pessoas, animais ou ao meio ambiente?', type: 'radio', options: ['Sim', 'Não', 'Não sei'], field: 'is_urgent' },
  ]
};

const categoryNames: any = {
  child: 'Criança e Adolescente',
  elderly: 'Idosos e Vulneráveis',
  env: 'Violência Ambiental'
};

export function generateStaticParams() {
  return [
    { type: 'child' },
    { type: 'elderly' },
    { type: 'env' },
  ];
}

export default async function DenunciarPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const steps = stepsByCategory[type] || [];
  const name = categoryNames[type] || 'Denúncia';

  return (
    <main className={styles.main}>
      <Navbar />
      <div className={`${styles.content} container section-padding`}>
        <div className={styles.header}>
          <h1>Nova Denúncia: <span className="text-gradient">{name}</span></h1>
          <p>Siga as etapas abaixo para registrar sua ocorrência de forma segura.</p>
        </div>
        
        <ComplaintForm type={type as any} steps={steps} />
      </div>
    </main>
  );
}
