/** Class to make elements get hidden */
const DISPLAY_NONE = "display-none";

/** ID of the settings pane */
const SETTINGS_PANE_ID = "settings-pane";

const SEARCH_BUTTON_ID = "search-button";
const CLEAR_BUTTON_ID = "clear-button";
const SETTINGS_BUTTON_ID = "settings-button";
const SEARCH_INPUT_ID = "search-input";

const engineEditor = document.getElementById("engine-editor") as HTMLDialogElement;
const groupEditor = document.getElementById("group-editor") as HTMLDialogElement;
const addEngineButton = document.getElementById("add-engine-button");
const addGroupButton = document.getElementById("add-group-button");
const engineEditorOkButton = document.getElementById("engine-editor-ok-button");
const groupEditorOkButton = document.getElementById("group-editor-ok-button");
const settingsButton = document.getElementById(SETTINGS_BUTTON_ID);
const searchButton = document.getElementById(SEARCH_BUTTON_ID);
const clearButton = document.getElementById(CLEAR_BUTTON_ID);
const searchInput = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement;
const resultPane = document.getElementById("result-pane") as HTMLDivElement;
const searchGroupSelect = document.getElementById("search-group-select") as HTMLSelectElement;

const engineTitleInput = document.getElementById("engine-title") as HTMLInputElement;
const engineUrlInput = document.getElementById("engine-url") as HTMLInputElement;
const engineIdInput = document.getElementById("engine-id") as HTMLInputElement;
const engineEditorDeleteButton = document.getElementById("engine-editor-delete-button");

const groupIdInput = document.getElementById("group-id") as HTMLInputElement;
const groupTitleInput = document.getElementById("group-title") as HTMLInputElement;
const groupEngine1Input = document.getElementById("group-engine-1") as HTMLInputElement;
const groupEngine2Checkbox = document.getElementById("group-engine-2-enabled") as HTMLInputElement;
const groupEngine2Input = document.getElementById("group-engine-2") as HTMLInputElement;
const groupEngine3Checkbox = document.getElementById("group-engine-3-enabled") as HTMLInputElement;
const groupEngine3Input = document.getElementById("group-engine-3") as HTMLInputElement;
const groupEngine4Checkbox = document.getElementById("group-engine-4-enabled") as HTMLInputElement;
const groupEngine4Input = document.getElementById("group-engine-4") as HTMLInputElement;
const groupEditorDeleteButton = document.getElementById("group-editor-delete-button");

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${JSON.stringify(oldValue, null, 2)}", new value is "${JSON.stringify(newValue, null, 2)}".`
    );
    writeSettingsPane();
  }
});

async function writeSettingsPane() {
  const { searchEngines, searchGroups, currentSearchGroupId } = await loadSetting();
  const engineList = document.getElementById("engine-list");
  const groupList = document.getElementById("group-list");
  if (engineList == null || groupList == null) {
    throw new Error("List element not found");
  }

  searchGroupSelect.innerHTML = "";

  for (const group of searchGroups) {
    const option = document.createElement("option");
    option.value = `${group.id}`;
    option.text = group.title;
    if (currentSearchGroupId === group.id) {
      option.selected = true;
    }
    searchGroupSelect.appendChild(option);
  }

  engineList.innerHTML = "";
  groupList.innerHTML = "";

  for (const engine of searchEngines) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.classList.add("search-entry");
    link.id = `${engine.id}`;
    link.innerText = engine.title || link.id;
    link.onclick = () => editEntry("engine", { engine });
    item.appendChild(link);
    engineList?.appendChild(item);
  }
  for (const group of searchGroups) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.classList.add("search-entry");
    link.id = `${group.id}`;
    link.innerText = group.title || link.id;
    link.onclick = () => editEntry("group", { group });
    item.appendChild(link);
    groupList?.appendChild(item);
  }

  const engineSelectors = document.getElementsByClassName("setting-engine-selector");
  for (const selector of engineSelectors) {
    selector.innerHTML = "";
    for (const engine of searchEngines) {
      const option = document.createElement("option");
      option.value = `${engine.id}`;
      option.text = engine.title;
      selector.appendChild(option);
    }
  }
}

function toggleSettingsPane() {
  const settingsPane = document.getElementById(SETTINGS_PANE_ID);
  if (settingsPane == null) {
    throw new Error("Settings pane not found, could not continue!");
  }

  if (settingsPane.classList.contains(DISPLAY_NONE)) {
    settingsPane.classList.remove(DISPLAY_NONE);
  } else {
    settingsPane.classList.add(DISPLAY_NONE);
  }
}

async function saveCurrentGroup(searchGroupSelect: HTMLSelectElement) {
  const id = parseInt(searchGroupSelect.value);
  chrome.storage.local.set<Setting>({ currentSearchGroupId: id });
}

async function runMultiSearch(input: HTMLInputElement, pane: HTMLDivElement) {
  const setting = await loadSetting();
  const searchGroup = setting.searchGroups.find((v) => v.id === setting.currentSearchGroupId);
  const searchEngines = setting.searchEngines.filter((v) => searchGroup?.engineIds.includes(v.id));

  pane.innerHTML = "";
  for (const engine of searchEngines) {
    const container = document.createElement("div");
    const header = document.createElement("h2");
    const iframe = document.createElement("iframe");
    header.innerText = engine.title;
    iframe.src = engine.url.replace("%s", input.value);
    container.classList.add("engine-result-container");
    container.appendChild(header);
    container.appendChild(iframe);
    pane.appendChild(container);
  }
}

function clearInput(input: HTMLInputElement) {
  input.value = "";
}

async function loadSetting() {
  return await chrome.storage.local.get<Setting>(null);
}

async function saveEngines(engines: SearchEngine[]) {
  await chrome.storage.local.set<Setting>({
    searchEngines: engines.sort((a, b) => a.id - b.id),
  });
}
async function saveGroups(groups: SearchGroup[]) {
  await chrome.storage.local.set<Setting>({
    searchGroups: groups.sort((a, b) => a.id - b.id),
  });
}

async function deleteEntry(entryId: { engineId?: number; groupId?: number }) {
  const { engineId, groupId } = entryId;
  if (engineId != undefined) {
    const { searchEngines } = await loadSetting();
    await saveEngines(searchEngines.filter((v) => v.id !== engineId));
  }
  if (groupId != undefined) {
    const { searchGroups } = await loadSetting();
    await saveGroups(searchGroups.filter((v) => v.id !== groupId));
  }
}

async function editEntry(
  type: "engine" | "group",
  entry: { engine?: SearchEngine; group?: SearchGroup }
) {
  const { engine, group } = entry;
  if (type === "engine") {
    engineIdInput.value = `${engine?.id ?? ""}`;
    engineTitleInput.value = engine?.title ?? "";
    engineUrlInput.value = engine?.url ?? "";
    engineEditor.showModal();
  }
  if (type === "group") {
    groupIdInput.value = `${group?.id ?? ""}`;
    groupTitleInput.value = group?.title ?? "";
    groupEngine1Input.value = `${group?.engineIds.at(0) ?? 0}`;
    groupEngine2Input.value = `${group?.engineIds.at(1) ?? 0}`;
    groupEngine3Input.value = `${group?.engineIds.at(2) ?? 0}`;
    groupEngine4Input.value = `${group?.engineIds.at(3) ?? 0}`;
    groupEngine2Checkbox.checked = (group?.engineIds.length ?? 0) >= 2;
    groupEngine3Checkbox.checked = (group?.engineIds.length ?? 0) >= 3;
    groupEngine4Checkbox.checked = (group?.engineIds.length ?? 0) >= 4;
    groupEditor.showModal();
  }
}

window.onload = async () => {
  addEngineButton?.addEventListener("click", () => editEntry("engine", {}));
  addGroupButton?.addEventListener("click", () => editEntry("group", {}));
  const dialogButtons = document.getElementsByClassName(
    "dialog-buttons"
  ) as HTMLCollectionOf<HTMLButtonElement>;
  for (const button of dialogButtons) {
    button.onclick = (e) => {
      e.preventDefault();
      engineEditor.close();
      groupEditor.close();
    };
  }

  searchInput.focus();
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchButton?.click();
  });
  settingsButton?.addEventListener("click", toggleSettingsPane);
  clearButton?.addEventListener("click", () => clearInput(searchInput));
  searchButton?.addEventListener("click", () => runMultiSearch(searchInput, resultPane));
  searchGroupSelect.addEventListener("change", () => saveCurrentGroup(searchGroupSelect));

  engineEditorDeleteButton?.addEventListener("click", () => {
    if (engineIdInput.value.length > 0) deleteEntry({ engineId: parseInt(engineIdInput.value) });
  });
  groupEditorDeleteButton?.addEventListener("click", () => {
    if (groupIdInput.value.length > 0) deleteEntry({ groupId: parseInt(groupIdInput.value) });
  });

  engineEditorOkButton?.addEventListener("click", async () => {
    let { searchEngines } = await loadSetting();
    let id: number;
    if (engineIdInput.value !== "") {
      id = parseInt(engineIdInput.value);
      await deleteEntry({ engineId: id });
    } else {
      const lastId = searchEngines.at(-1)?.id ?? 0;
      id = lastId + 1;
    }

    ({ searchEngines } = await loadSetting());
    searchEngines.push({ id, title: engineTitleInput.value, url: engineUrlInput.value });
    saveEngines(searchEngines);
  });

  groupEditorOkButton?.addEventListener("click", async () => {
    const engineIds: number[] = [parseInt(groupEngine1Input.value)];
    if (groupEngine2Checkbox.checked) engineIds.push(parseInt(groupEngine2Input.value));
    if (groupEngine3Checkbox.checked) engineIds.push(parseInt(groupEngine3Input.value));
    if (groupEngine4Checkbox.checked) engineIds.push(parseInt(groupEngine4Input.value));

    let { searchGroups } = await loadSetting();
    let id: number;
    if (groupIdInput.value !== "") {
      id = parseInt(groupIdInput.value);
      await deleteEntry({ groupId: id });
    } else {
      const lastId = searchGroups.at(-1)?.id ?? 0;
      id = lastId + 1;
    }

    ({ searchGroups } = await loadSetting());
    searchGroups.push({ id, title: groupTitleInput.value, engineIds });
    saveGroups(searchGroups);
  });

  writeSettingsPane();
};
