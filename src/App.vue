<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

// ---------- Раскладки ----------
const GEORGIAN_LAYOUT = {
  'a': 'ა', 'b': 'ბ', 'g': 'გ', 'd': 'დ', 'e': 'ე',
  'v': 'ვ', 'z': 'ზ', 'T': 'თ', 'i': 'ი', 'k': 'კ',
  'l': 'ლ', 'm': 'მ', 'n': 'ნ', 'o': 'ო', 'p': 'პ',
  'r': 'რ', 's': 'ს', 't': 'ტ', 'u': 'უ', 'f': 'ფ',
  'q': 'ქ', 'R': 'ღ', 'y': 'ყ', 'S': 'შ', 'C': 'ჩ',
  'c': 'ც', 'Z': 'ძ', 'w': 'წ', 'W': 'ჭ', 'x': 'ხ',
  'j': 'ჯ', 'h': 'ჰ',
};

const ARMENIAN_LAYOUT = {
  'a': 'ա', 'b': 'բ', 'c': 'ց', 'd': 'դ', 'e': 'ե',
  'f': 'ֆ', 'g': 'գ', 'h': 'հ', 'i': 'ի', 'j': 'ջ',
  'k': 'կ', 'l': 'լ', 'm': 'մ', 'n': 'ն', 'o': 'ո',
  'p': 'պ', 'q': 'ք', 'r': 'ր', 's': 'ս', 't': 'տ',
  'u': 'ու', 'v': 'վ', 'w': 'ւ', 'x': 'խ', 'y': 'յ',
  'z': 'զ', 'C': 'Չ', 'S': 'Շ', 'T': 'Թ', 'R': 'Ր',
  'P': 'Փ', 'K': 'Ք', 'G': 'Գ', 'D': 'Դ', 'Z': 'Զ',
  'V': 'Վ', 'B': 'Բ', 'M': 'Մ', 'N': 'Ն', 'L': 'Լ',
  'H': 'Հ', 'Y': 'Յ',
  ';': 'թ', "'": 'փ', '[': 'խ', ']': 'ծ',
};

const LAYOUTS = { georgian: GEORGIAN_LAYOUT, armenian: ARMENIAN_LAYOUT };
const LAYOUTS_DESC = { georgian:'грузинская', armenian: 'армянская' };

// ---------- Ключи localStorage ----------
const STORAGE_KEYS = {
  layoutName: 'keyboard.layoutName',
  layoutEnabled: 'keyboard.layoutEnabled',
};

// ---------- Состояние ----------
const inputEl = ref(null);
const text = ref('');
const layoutName = ref('georgian');
const layoutEnabled = ref(true);
const status = ref('');

const currentLayout = computed(() => LAYOUTS[layoutName.value] ?? GEORGIAN_LAYOUT);

const currentLayoutDesc = computed(() => LAYOUTS_DESC[layoutName.value] ?? LAYOUTS_DESC.georgian);

// ---------- localStorage: загрузка ----------
function loadState() {
  try {
    const savedName = localStorage.getItem(STORAGE_KEYS.layoutName);
    if (savedName && LAYOUTS[savedName]) {
      layoutName.value = savedName;
    }
    const savedEnabled = localStorage.getItem(STORAGE_KEYS.layoutEnabled);
    if (savedEnabled !== null) {
      layoutEnabled.value = savedEnabled === 'true';
    }
  } catch (_) {
    // localStorage может быть недоступен — работаем с дефолтами
  }
}

// ---------- localStorage: сохранение ----------
function saveLayoutName(name) {
  try { localStorage.setItem(STORAGE_KEYS.layoutName, name); } catch (_) {}
}
function saveLayoutEnabled(enabled) {
  try { localStorage.setItem(STORAGE_KEYS.layoutEnabled, String(enabled)); } catch (_) {}
}

// ---------- Статус ----------
let statusTimer = null;
function setStatus(msg) {
  status.value = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { status.value = ''; }, 5000);
}

// ---------- Вставка в позицию курсора ----------
function insertAtCursor(ch) {
  const el = inputEl.value;
  if (!el) return;

  const start = el.selectionStart;
  const end = el.selectionEnd;
  const value = text.value;

  text.value = value.slice(0, start) + ch + value.slice(end);

  // Восстанавливаем курсор после обновления DOM
  nextTick(() => {
    const newPos = start + ch.length;
    el.setSelectionRange(newPos, newPos);
    if (document.activeElement !== el) el.focus();
  });
}

// ---------- Перехват ввода ----------
function onKeydown(event) {
  if (!layoutEnabled.value) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.isComposing) return;

  if (event.key.length === 1 && currentLayout.value[event.key] !== undefined) {
    event.preventDefault();
    insertAtCursor(currentLayout.value[event.key]);
  }
}

function onBeforeInput(event) {
  if (!layoutEnabled.value) return;
  if (event.inputType !== 'insertText') return;
  if (event.isComposing) return;

  const data = event.data;
  if (!data || data.length !== 1) return;
  if (currentLayout.value[data] === undefined) return;

  event.preventDefault();
  insertAtCursor(currentLayout.value[data]);
}

// ---------- Обработчики кнопок ----------
function toggleLayout() {
  layoutEnabled.value = !layoutEnabled.value;
  saveLayoutEnabled(layoutEnabled.value);
  setStatus(layoutEnabled.value ? 'Раскладка включена.' : 'Раскладка отключена.');
  inputEl.value?.focus();
}

function onLayoutChange() {
  saveLayoutName(layoutName.value);
  const label = layoutName.value === 'armenian' ? 'армянскую' : 'грузинскую';
  setStatus(`Раскладка переключена на ${label}.`);
  inputEl.value?.focus();
}

function clearText() {
  text.value = '';
  inputEl.value?.focus();
  setStatus('Поле очищено.');
}

async function copyText() {
  if (!text.value) {
    setStatus('Поле пустое — нечего копировать.');
    return;
  }
  try {
    await navigator.clipboard.writeText(text.value);
    setStatus('Текст скопирован в буфер обмена.');
  } catch (err) {
    const el = inputEl.value;
    if (!el) return;
    el.select();
    try {
      document.execCommand('copy');
      setStatus('Текст скопирован (fallback).');
    } catch (e) {
      setStatus('Не удалось скопировать: ' + err.message);
    }
    const len = text.value.length;
    el.setSelectionRange(len, len);
  }
}

// ---------- Синхронизация между вкладками ----------
function onStorage(e) {
  if (e.key === STORAGE_KEYS.layoutName && e.newValue && LAYOUTS[e.newValue]) {
    layoutName.value = e.newValue;
  }
  if (e.key === STORAGE_KEYS.layoutEnabled && e.newValue !== null) {
    layoutEnabled.value = e.newValue === 'true';
  }
}

// ---------- Жизненный цикл ----------
onMounted(() => {
  loadState();
  inputEl.value?.focus();
  window.addEventListener('storage', onStorage);
});

onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorage);
  clearTimeout(statusTimer);
});
</script>

<template>
  <h1>Экранная раскладка</h1>

  <textarea
    ref="inputEl"
    v-model="text"
    :class="{ disabled: !layoutEnabled }"
    :placeholder="layoutEnabled
      ? 'Раскладка: '+currentLayoutDesc+'. Начните вводить латинские буквы...'
      : 'Раскладка отключена — ввод латиницей.'"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    @keydown="onKeydown"
    @beforeinput="onBeforeInput"
  ></textarea>

  <div class="buttons">
    <select v-model="layoutName" @change="onLayoutChange">
      <option value="georgian">Грузинская</option>
      <option value="armenian">Армянская</option>
    </select>

    <button
      type="button"
      class="toggle"
      :class="{ off: !layoutEnabled }"
      @click="toggleLayout"
    >
      Раскладка: {{ layoutEnabled ? 'ВКЛ' : 'ВЫКЛ' }}
    </button>

    <button type="button" @click="clearText">Очистить</button>
    <button type="button" @click="copyText">Копировать</button>
  </div>

  <div class="status">{{ status }}</div>

  <div class="hint">
    Набирайте латиницей — буквы преобразуются в выбранный язык.
  </div>
</template>

<style scoped>
h1 { font-size: 16px; margin: 0; padding: 0 2px; }

textarea {
  flex: 1 1 auto;
  width: 100%;
  min-height: 120px;
  font-size: 20px;
  line-height: 1.4;
  padding: 12px;
  border: 1px solid #888;
  border-radius: 8px;
  resize: none;
  -webkit-appearance: none;
  appearance: none;
}
textarea.disabled { background: #e9e9e9; color: #555; }

.buttons { display: flex; gap: 8px; flex-wrap: wrap; width: 100%; }

button, select {
  flex: 1 1 auto;
  min-height: 44px;
  font-size: 15px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

button { border: none; background: #4a6fa5; color: white; }
button:hover { background: #3b5a85; }

button.toggle { background: #2a7a2a; }
button.toggle.off { background: #a53b3b; }
button.toggle:hover { filter: brightness(0.92); }

select { border: 1px solid #888; background: white; }

.hint { font-size: 12px; color: #555; padding: 0 2px; }
.status { font-size: 13px; color: #2a7a2a; min-height: 18px; padding: 0 2px; }

@media (max-width: 600px) {
  h1 { font-size: 14px; }
  button, select { font-size: 14px; }
}
</style>