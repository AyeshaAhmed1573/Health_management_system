import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/authContext';
import { API_BASE } from '@/lib/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const SAMPLE_TYPES = ['blood', 'urine', 'stool', 'swab', 'tissue', 'saliva', 'other'];

const EMPTY = {
  name: '', code: '', category: '', sampleType: 'blood', description: '',
  preparationInstructions: '', fastingRequired: false, fastingHours: '',
  turnaroundHours: '', price: '', homeCollectionAvailable: false, homeCollectionFee: '',
};

/** Laboratory dashboard: add / edit / delete the tests patients can book from the lab's profile. */
export default function LabTestManagement() {
  const { token } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE}/lab-tests/tests?${params}`, { headers });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Could not load tests');
      setTests(data.data.tests || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, token]);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = (t) => {
    setEditing(t);
    setForm({
      ...EMPTY, ...t,
      fastingHours: t.fastingHours ?? '', homeCollectionFee: t.homeCollectionFee ?? '',
      code: t.code || '', description: t.description || '', preparationInstructions: t.preparationInstructions || '',
    });
    setShowForm(true);
  };

  const reset = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        // optional unique code - generate one so tests without a code never collide
        code: form.code.trim() || (editing ? undefined : `LT-${Date.now().toString(36).toUpperCase()}`),
        category: form.category.trim(),
        sampleType: form.sampleType,
        description: form.description,
        preparationInstructions: form.preparationInstructions,
        fastingRequired: !!form.fastingRequired,
        ...(form.fastingRequired && form.fastingHours !== '' ? { fastingHours: Number(form.fastingHours) } : {}),
        turnaroundHours: Number(form.turnaroundHours),
        price: Number(form.price),
        homeCollectionAvailable: !!form.homeCollectionAvailable,
        ...(form.homeCollectionAvailable && form.homeCollectionFee !== '' ? { homeCollectionFee: Number(form.homeCollectionFee) } : {}),
      };
      const res = await fetch(`${API_BASE}/lab-tests/tests${editing ? `/${editing._id}` : ''}`, {
        method: editing ? 'PUT' : 'POST', headers, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Could not save');
      reset();
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete "${t.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/lab-tests/tests/${t._id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Could not delete');
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Lab Test Management</h1>
        <Button onClick={() => { reset(); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> Add Test</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search tests…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? 'Edit test' : 'Add new test'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Test name *</Label><Input required value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
                <div><Label>Code (optional)</Label><Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="auto-generated if empty" /></div>
                <div><Label>Category *</Label><Input required value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Hematology, Biochemistry" /></div>
                <div>
                  <Label>Sample type *</Label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.sampleType} onChange={(e) => set('sampleType', e.target.value)}>
                    {SAMPLE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><Label>Price (PKR) *</Label><Input required type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
                <div><Label>Turnaround (hours) *</Label><Input required type="number" min="0" value={form.turnaroundHours} onChange={(e) => set('turnaroundHours', e.target.value)} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
              <div><Label>Preparation instructions</Label><Textarea value={form.preparationInstructions} onChange={(e) => set('preparationInstructions', e.target.value)} /></div>
              <div className="flex flex-wrap gap-6 items-end">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.fastingRequired} onChange={(e) => set('fastingRequired', e.target.checked)} /> Fasting required</label>
                {form.fastingRequired && <div><Label>Fasting hours</Label><Input type="number" min="0" className="w-28" value={form.fastingHours} onChange={(e) => set('fastingHours', e.target.value)} /></div>}
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.homeCollectionAvailable} onChange={(e) => set('homeCollectionAvailable', e.target.checked)} /> Home collection</label>
                {form.homeCollectionAvailable && <div><Label>Home collection fee</Label><Input type="number" min="0" className="w-28" value={form.homeCollectionFee} onChange={(e) => set('homeCollectionFee', e.target.value)} /></div>}
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update test' : 'Create test'}</Button>
                <Button type="button" variant="outline" onClick={reset}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? <p className="text-muted-foreground">Loading…</p>
        : error ? <p className="text-red-600">{error}</p>
        : tests.length === 0 ? <p className="text-muted-foreground">No tests yet. Click "Add Test" to publish your first one — patients will see it on your laboratory profile.</p>
        : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((t) => (
              <Card key={t._id}>
                <CardContent className="pt-6 space-y-2">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-bold">{t.name}</h3>
                    <span className="font-semibold text-primary whitespace-nowrap">PKR {t.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.category} · {t.sampleType} sample · results in {t.turnaroundHours}h</p>
                  {t.fastingRequired && <p className="text-xs">Fasting required{t.fastingHours ? ` (${t.fastingHours}h)` : ''}</p>}
                  {t.homeCollectionAvailable && <p className="text-xs text-green-700">Home collection available</p>}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(t)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => remove(t)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
