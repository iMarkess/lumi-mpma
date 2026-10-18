'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import styles from './ProtocolLookup.module.css';

/** Campo de protocolo da home: leva para /acompanhar?p=... já consultando. */
export default function ProtocolLookup() {
  const [value, setValue] = useState('');
  const router = useRouter();

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        const p = value.trim().toUpperCase();
        if (p) router.push(`/acompanhar?p=${encodeURIComponent(p)}`);
      }}
    >
      <label htmlFor="home-protocolo" className="sr-only">
        Número do protocolo
      </label>
      <input
        id="home-protocolo"
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="LUMI-XXXXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
      />
      <button type="submit" className={styles.button}>
        Consultar
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </form>
  );
}
