import { useCallback, useEffect, useState } from "react";

import { fetchSiteData, type SiteData } from "@/api";
import { LogoMark } from "@/components/site/site-header";
import { CATEGORY_LABEL, EMPTY_SETTINGS, formatPrice } from "@/site-config";

const KEY = "adasat-admin-key";

async function resizeToWebp(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.85),
  );
  if (!blob) return file;
  return new File([blob], "product.webp", { type: "image/webp" });
}

export function AdminPage() {
  const [data, setData] = useState<SiteData>({
    products: [],
    settings: EMPTY_SETTINGS,
    adminReady: true,
  });
  const [loaded, setLoaded] = useState(false);
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const next = await fetchSiteData();
    if (next) setData(next);
    setLoaded(true);
  }, []);

  const postProducts = async (form: FormData, adminKey: string) => {
    form.set("admin_key", adminKey);
    const res = await fetch("/api/products.php", {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: form,
    });
    return res.ok;
  };

  const login = useCallback(async (candidate: string) => {
    const form = new FormData();
    form.set("op", "ping");
    if (await postProducts(form, candidate)) {
      sessionStorage.setItem(KEY, candidate);
      setKey(candidate);
      setAuthed(true);
      setMsg("");
    } else {
      sessionStorage.removeItem(KEY);
      setMsg("كلمة المرور غير صحيحة");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const saved = sessionStorage.getItem(KEY);
    if (saved) void login(saved);
  }, [refresh, login]);

  const onAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    const file = fd.get("file");
    if (!(file instanceof File) || !file.size) {
      setMsg("اختر صورة للمنتج");
      return;
    }
    setBusy(true);
    setMsg("جارٍ الرفع...");
    try {
      fd.set("file", await resizeToWebp(file));
      fd.set("op", "add");
      if (await postProducts(fd, key)) {
        formEl.reset();
        setMsg("تمت إضافة المنتج");
        await refresh();
      } else {
        setMsg("تعذّرت الإضافة، تحقق من البيانات");
      }
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("حذف هذا المنتج؟")) return;
    const fd = new FormData();
    fd.set("op", "delete");
    fd.set("id", String(id));
    if (await postProducts(fd, key)) {
      setMsg("تم الحذف");
      await refresh();
    } else {
      setMsg("تعذّر الحذف");
    }
  };

  const onSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = { ...Object.fromEntries(new FormData(e.currentTarget).entries()), admin_key: key };
    const res = await fetch("/api/settings.php", {
      method: "POST",
      headers: { "x-admin-key": key, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setMsg(res.ok ? "تم حفظ معلومات التواصل" : "تعذّر الحفظ");
    if (res.ok) await refresh();
  };

  if (!authed) {
    return (
      <main className="adm">
        <a className="brand" href="/">
          <LogoMark />
          <span>عدسات عمان</span>
        </a>
        <h1>لوحة إدارة المنتجات</h1>
        {!loaded || data.adminReady ? (
          <form
            className="adm__card"
            onSubmit={(e) => {
              e.preventDefault();
              void login(String(new FormData(e.currentTarget).get("password") ?? ""));
            }}
          >
            <label>
              كلمة المرور
              <input autoComplete="current-password" name="password" required type="password" />
            </label>
            <button className="adm__btn" type="submit">
              دخول
            </button>
            {msg ? <p className="adm__msg">{msg}</p> : null}
          </form>
        ) : (
          <div className="adm__card">
            <p>
              لم يتم ضبط كلمة مرور الإدارة بعد. انسخ الملف api/config.sample.php إلى api/config.php
              على الاستضافة واكتب كلمة المرور فيه (6 أحرف على الأقل).
            </p>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="adm">
      <div className="coll__head">
        <h1>لوحة إدارة المنتجات</h1>
        <button
          className="adm__ghost"
          onClick={() => {
            sessionStorage.removeItem(KEY);
            setAuthed(false);
            setKey("");
          }}
          type="button"
        >
          خروج
        </button>
      </div>
      {msg ? <p className="adm__msg">{msg}</p> : null}

      <section>
        <h2>إضافة منتج</h2>
        <form className="adm__card" onSubmit={onAdd}>
          <div className="adm__row">
            <label>
              اسم المنتج
              <input maxLength={80} name="name" required />
            </label>
            <label>
              النوع
              <select name="category" defaultValue="medical">
                <option value="medical">نظارة طبية</option>
                <option value="sun">نظارة شمسية</option>
              </select>
            </label>
            <label>
              السعر (ر.ع)
              <input inputMode="decimal" min="0" name="price" required step="0.001" type="number" />
            </label>
          </div>
          <label>
            وصف قصير
            <input maxLength={160} name="description" />
          </label>
          <label>
            صورة المنتج
            <input accept="image/*" name="file" required type="file" />
          </label>
          <button className="adm__btn" disabled={busy} type="submit">
            إضافة المنتج
          </button>
        </form>
      </section>

      <section>
        <h2>المنتجات الحالية</h2>
        <div className="adm__list">
          {data.products.map((p) => (
            <div className="adm__item" key={p.id}>
              <img alt={p.name} height={80} src={p.image} width={64} />
              <div>
                <strong>{p.name}</strong>
                <p>
                  {CATEGORY_LABEL[p.category]} · {formatPrice(p.price)}
                </p>
              </div>
              <button className="adm__ghost" onClick={() => void onDelete(p.id)} type="button">
                حذف
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>معلومات التواصل</h2>
        <form className="adm__card" key={JSON.stringify(data.settings)} onSubmit={onSettings}>
          <div className="adm__row">
            <label>
              رقم واتساب (بالصيغة الدولية، مثال 96890000000)
              <input defaultValue={data.settings.whatsapp} inputMode="numeric" name="whatsapp" />
            </label>
            <label>
              حساب انستغرام
              <input defaultValue={data.settings.instagram} name="instagram" />
            </label>
          </div>
          <label>
            العنوان
            <input defaultValue={data.settings.address} name="address" />
          </label>
          <label>
            ساعات العمل
            <input defaultValue={data.settings.hours} name="hours" />
          </label>
          <button className="adm__btn" type="submit">
            حفظ
          </button>
        </form>
      </section>
    </main>
  );
}
