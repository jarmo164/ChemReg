import { useMemo, useState } from "react";
import { MiniSdsDocument, MiniSdsPayload } from "../types/sds";
import { miniSdsDocuments } from "../data/sdsMockData";

type FormMode = "create" | "edit";

type FormState = MiniSdsPayload;

const createEmptyPayload = (): FormState => ({
  document: {
    productName: "",
    supplierNameRaw: "",
    language: "et",
    countryFormat: "EE",
    revisionDate: "",
    expiryDate: "",
    status: "active",
  },
  summary: {
    intendedUse: "",
    signalWord: "",
    physicalState: "",
    emergencyPhone: "",
  },
  hazards: {
    hazardStatements: [""],
    precautionaryStatements: [""],
    pictograms: [],
  },
  firstAid: {
    inhalation: "",
    skinContact: "",
    eyeContact: "",
    ingestion: "",
  },
  fireResponse: {
    extinguishingMedia: "",
    specialHazards: "",
    protectiveEquipment: "",
  },
  spillHandling: {
    personalPrecautions: "",
    environmentalPrecautions: "",
    cleanupMethods: "",
  },
  handlingStorage: {
    safeHandling: "",
    safeStorage: "",
    incompatibleMaterials: "",
  },
  exposureControl: {
    exposureLimits: "",
    engineeringControls: "",
    ppe: "",
  },
  composition: {
    components: [
      {
        substanceName: "",
        casNumber: "",
        ecNumber: "",
        concentrationMin: "",
        concentrationMax: "",
      },
    ],
  },
  transportDisposal: {
    unNumber: "",
    transportHazardClass: "",
    packingGroup: "",
    wasteHandling: "",
  },
});

const languageOptions = ["et", "en", "fi", "lv", "lt"];
const countryOptions = ["EE", "FI", "LV", "LT", "SE"];
const statusOptions = ["active", "pending_review", "archived"] as const;
const pictogramOptions = ["GHS01", "GHS02", "GHS03", "GHS04", "GHS05", "GHS06", "GHS07", "GHS08", "GHS09"];

const pageShell = "min-h-screen bg-slate-100 text-slate-900";
const panel = "rounded-3xl border border-slate-200 bg-white shadow-sm";
const sectionTitle = "text-lg font-semibold text-slate-900";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";
const inputClass = "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";
const textareaClass = `${inputClass} min-h-[104px] resize-y`;
const buttonBase = "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition";

export default function SdsManagement() {
  const [documents, setDocuments] = useState<MiniSdsDocument[]>(miniSdsDocuments);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<FormMode>("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(createEmptyPayload());
  const [lastSubmittedJson, setLastSubmittedJson] = useState<string>("");

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((doc) =>
      [doc.id, doc.productName, doc.supplierName, doc.language, doc.countryFormat]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [documents, search]);

  const openCreate = () => {
    setMode("create");
    setSelectedId(null);
    setFormState(createEmptyPayload());
  };

  const openEdit = (doc: MiniSdsDocument) => {
    setMode("edit");
    setSelectedId(doc.id);
    setFormState(structuredClone(doc.payload));
  };

  const updateDocumentField = (field: keyof FormState["document"], value: string) => {
    setFormState((current) => ({
      ...current,
      document: {
        ...current.document,
        [field]: value,
      },
    }));
  };

  const updateSummaryField = (field: keyof FormState["summary"], value: string) => {
    setFormState((current) => ({
      ...current,
      summary: {
        ...current.summary,
        [field]: value,
      },
    }));
  };

  const updateNestedTextGroup = (
    group: "firstAid" | "fireResponse" | "spillHandling" | "handlingStorage" | "exposureControl" | "transportDisposal",
    field: string,
    value: string
  ) => {
    setFormState((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  };

  const updateListField = (field: "hazardStatements" | "precautionaryStatements", index: number, value: string) => {
    setFormState((current) => {
      const next = [...current.hazards[field]];
      next[index] = value;
      return {
        ...current,
        hazards: {
          ...current.hazards,
          [field]: next,
        },
      };
    });
  };

  const addListItem = (field: "hazardStatements" | "precautionaryStatements") => {
    setFormState((current) => ({
      ...current,
      hazards: {
        ...current.hazards,
        [field]: [...current.hazards[field], ""],
      },
    }));
  };

  const togglePictogram = (code: string) => {
    setFormState((current) => {
      const exists = current.hazards.pictograms.includes(code);
      return {
        ...current,
        hazards: {
          ...current.hazards,
          pictograms: exists
            ? current.hazards.pictograms.filter((item) => item !== code)
            : [...current.hazards.pictograms, code],
        },
      };
    });
  };

  const updateComponent = (index: number, field: keyof FormState["composition"]["components"][number], value: string) => {
    setFormState((current) => ({
      ...current,
      composition: {
        components: current.composition.components.map((component, componentIndex) =>
          componentIndex === index ? { ...component, [field]: value } : component
        ),
      },
    }));
  };

  const addComponent = () => {
    setFormState((current) => ({
      ...current,
      composition: {
        components: [
          ...current.composition.components,
          {
            substanceName: "",
            casNumber: "",
            ecNumber: "",
            concentrationMin: "",
            concentrationMax: "",
          },
        ],
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = structuredClone(formState);
    const productName = payload.document.productName.trim();
    const supplierName = payload.document.supplierNameRaw.trim();

    const record: MiniSdsDocument = {
      id: selectedId ?? `SDS-${String(documents.length + 1).padStart(3, "0")}`,
      productName,
      supplierName,
      revisionDate: payload.document.revisionDate,
      language: payload.document.language,
      countryFormat: payload.document.countryFormat,
      status: mode === "create" ? "draft" : "ready",
      payload,
    };

    setDocuments((current) => {
      if (mode === "edit" && selectedId) {
        return current.map((doc) => (doc.id === selectedId ? record : doc));
      }
      return [record, ...current];
    });

    setSelectedId(record.id);
    setMode("edit");
    setLastSubmittedJson(JSON.stringify(payload, null, 2));
  };

  return (
    <div className={pageShell}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <aside className={`${panel} h-fit w-full p-5 lg:sticky lg:top-6 lg:w-[340px]`}>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Issue #42</p>
              <h1 className="mt-2 text-2xl font-bold">SDS form</h1>
              <p className="mt-2 text-sm text-slate-600">Open existing mock SDS entries or create a new one. Submit returns backend-ready JSON.</p>
            </div>
            <button className={`${buttonBase} bg-emerald-600 text-white hover:bg-emerald-700`} onClick={openCreate}>
              + Add SDS
            </button>
          </div>

          <label className={labelClass} htmlFor="sds-search">Search SDS</label>
          <input
            id="sds-search"
            className={inputClass}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, supplier or ID"
          />

          <div className="mt-5 space-y-3">
            {filteredDocuments.map((doc) => {
              const active = selectedId === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => openEdit(doc)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{doc.id}</p>
                      <p className="mt-1 font-semibold text-slate-900">{doc.productName}</p>
                      <p className="mt-1 text-sm text-slate-600">{doc.supplierName}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${doc.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {doc.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className={`${panel} p-6`}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className={sectionTitle}>{mode === "create" ? "Create new SDS" : `Edit ${selectedId}`}</h2>
                  <p className="mt-1 text-sm text-slate-600">The form is structured as a compact mini-SDS and produces nested JSON for the backend.</p>
                </div>
                <button type="submit" className={`${buttonBase} bg-slate-900 text-white hover:bg-slate-700`}>
                  Save & generate JSON
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Product name">
                  <input className={inputClass} value={formState.document.productName} onChange={(e) => updateDocumentField("productName", e.target.value)} required />
                </Field>
                <Field label="Supplier">
                  <input className={inputClass} value={formState.document.supplierNameRaw} onChange={(e) => updateDocumentField("supplierNameRaw", e.target.value)} required />
                </Field>
                <Field label="Revision date">
                  <input type="date" className={inputClass} value={formState.document.revisionDate} onChange={(e) => updateDocumentField("revisionDate", e.target.value)} required />
                </Field>
                <Field label="Expiry date">
                  <input type="date" className={inputClass} value={formState.document.expiryDate} onChange={(e) => updateDocumentField("expiryDate", e.target.value)} />
                </Field>
                <Field label="Language">
                  <select className={inputClass} value={formState.document.language} onChange={(e) => updateDocumentField("language", e.target.value)}>
                    {languageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Country format">
                  <select className={inputClass} value={formState.document.countryFormat} onChange={(e) => updateDocumentField("countryFormat", e.target.value)}>
                    {countryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select className={inputClass} value={formState.document.status} onChange={(e) => updateDocumentField("status", e.target.value)}>
                    {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Signal word">
                  <input className={inputClass} value={formState.summary.signalWord} onChange={(e) => updateSummaryField("signalWord", e.target.value)} placeholder="Danger / Warning" />
                </Field>
                <Field label="Physical state">
                  <input className={inputClass} value={formState.summary.physicalState} onChange={(e) => updateSummaryField("physicalState", e.target.value)} placeholder="liquid / solid / gas" />
                </Field>
              </div>
            </section>

            <section className={`${panel} p-6`}>
              <h3 className={sectionTitle}>Operational summary</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Intended use">
                  <textarea className={textareaClass} value={formState.summary.intendedUse} onChange={(e) => updateSummaryField("intendedUse", e.target.value)} />
                </Field>
                <Field label="Emergency phone">
                  <input className={inputClass} value={formState.summary.emergencyPhone} onChange={(e) => updateSummaryField("emergencyPhone", e.target.value)} />
                </Field>
              </div>
            </section>

            <section className={`${panel} p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className={sectionTitle}>Hazards</h3>
                <div className="flex flex-wrap gap-2">
                  {pictogramOptions.map((code) => {
                    const active = formState.hazards.pictograms.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => togglePictogram(code)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-emerald-500 bg-emerald-100 text-emerald-800" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"}`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <ListEditor
                  title="Hazard statements"
                  values={formState.hazards.hazardStatements}
                  onChange={(index, value) => updateListField("hazardStatements", index, value)}
                  onAdd={() => addListItem("hazardStatements")}
                />
                <ListEditor
                  title="Precautionary statements"
                  values={formState.hazards.precautionaryStatements}
                  onChange={(index, value) => updateListField("precautionaryStatements", index, value)}
                  onAdd={() => addListItem("precautionaryStatements")}
                />
              </div>
            </section>

            <GridSection title="First aid">
              <TextAreaField label="Inhalation" value={formState.firstAid.inhalation} onChange={(value) => updateNestedTextGroup("firstAid", "inhalation", value)} />
              <TextAreaField label="Skin contact" value={formState.firstAid.skinContact} onChange={(value) => updateNestedTextGroup("firstAid", "skinContact", value)} />
              <TextAreaField label="Eye contact" value={formState.firstAid.eyeContact} onChange={(value) => updateNestedTextGroup("firstAid", "eyeContact", value)} />
              <TextAreaField label="Ingestion" value={formState.firstAid.ingestion} onChange={(value) => updateNestedTextGroup("firstAid", "ingestion", value)} />
            </GridSection>

            <GridSection title="Fire response">
              <TextAreaField label="Extinguishing media" value={formState.fireResponse.extinguishingMedia} onChange={(value) => updateNestedTextGroup("fireResponse", "extinguishingMedia", value)} />
              <TextAreaField label="Special hazards" value={formState.fireResponse.specialHazards} onChange={(value) => updateNestedTextGroup("fireResponse", "specialHazards", value)} />
              <TextAreaField label="Protective equipment" value={formState.fireResponse.protectiveEquipment} onChange={(value) => updateNestedTextGroup("fireResponse", "protectiveEquipment", value)} />
            </GridSection>

            <GridSection title="Spill handling">
              <TextAreaField label="Personal precautions" value={formState.spillHandling.personalPrecautions} onChange={(value) => updateNestedTextGroup("spillHandling", "personalPrecautions", value)} />
              <TextAreaField label="Environmental precautions" value={formState.spillHandling.environmentalPrecautions} onChange={(value) => updateNestedTextGroup("spillHandling", "environmentalPrecautions", value)} />
              <TextAreaField label="Cleanup methods" value={formState.spillHandling.cleanupMethods} onChange={(value) => updateNestedTextGroup("spillHandling", "cleanupMethods", value)} />
            </GridSection>

            <GridSection title="Handling and storage">
              <TextAreaField label="Safe handling" value={formState.handlingStorage.safeHandling} onChange={(value) => updateNestedTextGroup("handlingStorage", "safeHandling", value)} />
              <TextAreaField label="Safe storage" value={formState.handlingStorage.safeStorage} onChange={(value) => updateNestedTextGroup("handlingStorage", "safeStorage", value)} />
              <TextAreaField label="Incompatible materials" value={formState.handlingStorage.incompatibleMaterials} onChange={(value) => updateNestedTextGroup("handlingStorage", "incompatibleMaterials", value)} />
            </GridSection>

            <GridSection title="Exposure control / PPE">
              <TextAreaField label="Exposure limits" value={formState.exposureControl.exposureLimits} onChange={(value) => updateNestedTextGroup("exposureControl", "exposureLimits", value)} />
              <TextAreaField label="Engineering controls" value={formState.exposureControl.engineeringControls} onChange={(value) => updateNestedTextGroup("exposureControl", "engineeringControls", value)} />
              <TextAreaField label="PPE" value={formState.exposureControl.ppe} onChange={(value) => updateNestedTextGroup("exposureControl", "ppe", value)} />
            </GridSection>

            <section className={`${panel} p-6`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className={sectionTitle}>Composition</h3>
                <button type="button" onClick={addComponent} className={`${buttonBase} border border-slate-300 bg-white text-slate-700 hover:border-slate-400`}>
                  + Add component
                </button>
              </div>
              <div className="space-y-4">
                {formState.composition.components.map((component, index) => (
                  <div key={index} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-5">
                    <Field label="Substance name">
                      <input className={inputClass} value={component.substanceName} onChange={(e) => updateComponent(index, "substanceName", e.target.value)} />
                    </Field>
                    <Field label="CAS number">
                      <input className={inputClass} value={component.casNumber} onChange={(e) => updateComponent(index, "casNumber", e.target.value)} />
                    </Field>
                    <Field label="EC number">
                      <input className={inputClass} value={component.ecNumber} onChange={(e) => updateComponent(index, "ecNumber", e.target.value)} />
                    </Field>
                    <Field label="Concentration min %">
                      <input className={inputClass} value={component.concentrationMin} onChange={(e) => updateComponent(index, "concentrationMin", e.target.value)} />
                    </Field>
                    <Field label="Concentration max %">
                      <input className={inputClass} value={component.concentrationMax} onChange={(e) => updateComponent(index, "concentrationMax", e.target.value)} />
                    </Field>
                  </div>
                ))}
              </div>
            </section>

            <GridSection title="Transport and disposal">
              <TextAreaField label="UN number" value={formState.transportDisposal.unNumber} onChange={(value) => updateNestedTextGroup("transportDisposal", "unNumber", value)} />
              <TextAreaField label="Transport hazard class" value={formState.transportDisposal.transportHazardClass} onChange={(value) => updateNestedTextGroup("transportDisposal", "transportHazardClass", value)} />
              <TextAreaField label="Packing group" value={formState.transportDisposal.packingGroup} onChange={(value) => updateNestedTextGroup("transportDisposal", "packingGroup", value)} />
              <TextAreaField label="Waste handling" value={formState.transportDisposal.wasteHandling} onChange={(value) => updateNestedTextGroup("transportDisposal", "wasteHandling", value)} />
            </GridSection>
          </form>

          <section className={`${panel} p-6`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className={sectionTitle}>Generated JSON</h3>
                <p className="mt-1 text-sm text-slate-600">This is the payload returned by form submission and ready to hand off to the backend.</p>
              </div>
            </div>
            <pre className="max-h-[560px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-emerald-200">{lastSubmittedJson || JSON.stringify(formState, null, 2)}</pre>
          </section>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <textarea className={textareaClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function GridSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={`${panel} p-6`}>
      <h3 className={sectionTitle}>{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function ListEditor({ title, values, onChange, onAdd }: { title: string; values: string[]; onChange: (index: number, value: string) => void; onAdd: () => void }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <button type="button" onClick={onAdd} className={`${buttonBase} border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:border-slate-400`}>
          + Add line
        </button>
      </div>
      <div className="space-y-3">
        {values.map((value, index) => (
          <textarea key={`${title}-${index}`} className={textareaClass} value={value} onChange={(event) => onChange(index, event.target.value)} />
        ))}
      </div>
    </div>
  );
}
