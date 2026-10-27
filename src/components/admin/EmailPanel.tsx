"use client";

import { useEffect, useState } from 'react';

/**
 * Simple admin panel to manage Email Accounts and Templates.
 * Uses the API routes we defined under /api/email/*.
 * For brevity we rely on `window.prompt` for create/edit actions –
 * a production UI would use proper modals.
 */
export default function EmailPanel() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);

  const fetchData = async () => {
    const [accRes, tmplRes] = await Promise.all([
      fetch('/api/email/account'),
      fetch('/api/email/template'),
    ]);
    const accJson = await accRes.json();
    const tmplJson = await tmplRes.json();
    setAccounts(accJson.accounts || []);
    setTemplates(tmplJson.templates || []);
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const reload = () => setRefresh((r) => r + 1);

  // ----- Account actions -----
  const addAccount = async () => {
    const name = window.prompt('Nombre de la cuenta');
    const email = window.prompt('Dirección de email');
    if (!name || !email) return;
    await fetch('/api/email/account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    reload();
  };

  const deleteAccount = async (email: string) => {
    if (!confirm(`Eliminar cuenta ${email}?`)) return;
    await fetch('/api/email/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    reload();
  };

  // ----- Template actions -----
  const addTemplate = async () => {
    const slug = window.prompt('Slug (identificador único)');
    const name = window.prompt('Nombre descriptivo');
    const subject = window.prompt('Asunto del email (puede usar {{email}})');
    const html = window.prompt('HTML del cuerpo');
    const accountId = window.prompt('ID de EmailAccount a usar');
    if (!slug || !name || !subject || !html || !accountId) return;
    await fetch('/api/email/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name, subject, html, account: accountId }),
    });
    reload();
  };

  const deleteTemplate = async (slug: string) => {
    if (!confirm(`Eliminar plantilla ${slug}?`)) return;
    await fetch('/api/email/template', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
    reload();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Panel de Correos Corporativo</h2>

      {/* Accounts */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">Cuentas de envío</h3>
          <button
            className="bg-indigo-600 text-white px-3 py-1 rounded"
            onClick={addAccount}
          >
            + Añadir cuenta
          </button>
        </div>
        <ul className="list-disc pl-6">
          {accounts.map((a) => (
            <li key={a.email} className="flex justify-between items-center">
              <span>{a.name} &lt;{a.email}&gt;</span>
              <button
                className="text-red-600 underline"
                onClick={() => deleteAccount(a.email)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Templates */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">Plantillas de email</h3>
          <button
            className="bg-indigo-600 text-white px-3 py-1 rounded"
            onClick={addTemplate}
          >
            + Añadir plantilla
          </button>
        </div>
        <ul className="list-disc pl-6">
          {templates.map((t) => (
            <li key={t.slug} className="flex justify-between items-center">
              <span>{t.name} (slug: {t.slug})</span>
              <button
                className="text-red-600 underline"
                onClick={() => deleteTemplate(t.slug)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
