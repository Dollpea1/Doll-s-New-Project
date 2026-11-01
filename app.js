/**
 * NutriTrack - Pure Vanilla JavaScript Application
 * Persistent browser storage using localStorage.
 */

(function () {
  'use strict';

  // --- STORAGE KEYS & INITIAL STATE ---
  const STORAGE_KEY = 'nutritrack_app_data_v1';

  const DEFAULT_SETTINGS = {
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFat: 65,
    targetWater: 8
  };

  const FOOD_PRESETS = [
    { name: 'Oatmeal & Berries', meal: 'breakfast', calories: 280, protein: 10, carbs: 48, fat: 5, serving: '1 bowl (50g oats)' },
    { name: '2 Scrambled Eggs', meal: 'breakfast', calories: 180, protein: 13, carbs: 2, fat: 12, serving: '2 large eggs' },
    { name: 'Greek Yogurt (Nonfat)', meal: 'snack', calories: 130, protein: 17, carbs: 6, fat: 0, serving: '170g container' },
    { name: 'Chicken Breast & Rice', meal: 'lunch', calories: 480, protein: 45, carbs: 46, fat: 7, serving: '180g chicken, 1 cup rice' },
    { name: 'Whey Protein Shake', meal: 'snack', calories: 160, protein: 30, carbs: 3, fat: 2, serving: '1 scoop + water' },
    { name: 'Grilled Salmon & Veggies', meal: 'dinner', calories: 520, protein: 42, carbs: 12, fat: 28, serving: '200g filet' },
    { name: 'Medium Banana', meal: 'snack', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, serving: '1 medium (118g)' },
    { name: 'Avocado Toast', meal: 'breakfast', calories: 290, protein: 7, carbs: 30, fat: 16, serving: '1 thick slice' },
    { name: 'Mixed Nuts (Almonds & Walnuts)', meal: 'snack', calories: 190, protein: 5, carbs: 6, fat: 17, serving: '30g handful' },
    { name: 'Turkey & Cheese Wrap', meal: 'lunch', calories: 410, protein: 32, carbs: 38, fat: 14, serving: '1 whole wrap' },
    { name: 'Steak & Sweet Potato', meal: 'dinner', calories: 640, protein: 52, carbs: 42, fat: 24, serving: '220g sirloin' },
    { name: 'Apple with Peanut Butter', meal: 'snack', calories: 230, protein: 5, carbs: 28, fat: 12, serving: '1 apple + 1.5 tbsp PB' }
  ];

  // Application State
  let appState = {
    settings: { ...DEFAULT_SETTINGS },
    days: {} // Keyed by 'YYYY-MM-DD'
  };

  // Selected date state
  let currentDate = getTodayFormatted();

  // DOM Elements
  const datePicker = document.getElementById('date-picker');
  const dateString = document.getElementById('date-string');
  const dateDisplayBadge = document.getElementById('date-display-badge');
  const prevDayBtn = document.getElementById('prev-day-btn');
  const nextDayBtn = document.getElementById('next-day-btn');

  // Gauge & Stat elements
  const gaugeFillCircle = document.getElementById('gauge-fill-circle');
  const caloriesRemainingNumber = document.getElementById('calories-remaining-number');
  const caloriesRemainingLabel = document.getElementById('calories-remaining-label');
  const statGoalCalories = document.getElementById('stat-goal-calories');
  const statEatenCalories = document.getElementById('stat-eaten-calories');
  const statProgressPct = document.getElementById('stat-progress-pct');
  const budgetStatusPill = document.getElementById('budget-status-pill');
  const mainMeterFill = document.getElementById('main-meter-fill');

  // Macro elements
  const proteinCurrent = document.getElementById('protein-current');
  const proteinTarget = document.getElementById('protein-target');
  const proteinBarFill = document.getElementById('protein-bar-fill');
  const proteinCalText = document.getElementById('protein-cal-text');

  const carbsCurrent = document.getElementById('carbs-current');
  const carbsTarget = document.getElementById('carbs-target');
  const carbsBarFill = document.getElementById('carbs-bar-fill');
  const carbsCalText = document.getElementById('carbs-cal-text');

  const fatCurrent = document.getElementById('fat-current');
  const fatTarget = document.getElementById('fat-target');
  const fatBarFill = document.getElementById('fat-bar-fill');
  const fatCalText = document.getElementById('fat-cal-text');

  // Water elements
  const waterCount = document.getElementById('water-count');
  const waterGoal = document.getElementById('water-goal');
  const waterMl = document.getElementById('water-ml');
  const waterGlassesContainer = document.getElementById('water-glasses-container');
  const waterMinusBtn = document.getElementById('water-minus-btn');
  const waterPlusBtn = document.getElementById('water-plus-btn');

  // Chart element
  const miniChartBars = document.getElementById('mini-chart-bars');
  const chartAvgLabel = document.getElementById('chart-avg-label');

  // Form elements
  const foodLogForm = document.getElementById('food-log-form');
  const editEntryId = document.getElementById('edit-entry-id');
  const formCardTitle = document.getElementById('form-card-title');
  const submitBtnLabel = document.getElementById('submit-btn-label');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const foodNameInput = document.getElementById('food-name');
  const foodMealSelect = document.getElementById('food-meal-category');
  const foodCaloriesInput = document.getElementById('food-calories');
  const foodProteinInput = document.getElementById('food-protein');
  const foodCarbsInput = document.getElementById('food-carbs');
  const foodFatInput = document.getElementById('food-fat');
  const foodServingInput = document.getElementById('food-serving');

  // Presets drawer elements
  const quickPresetToggleBtn = document.getElementById('quick-preset-toggle-btn');
  const quickPresetsDrawer = document.getElementById('quick-presets-drawer');
  const presetChipsList = document.getElementById('preset-chips-list');

  // Meal lists elements
  const mealItemLists = {
    breakfast: document.getElementById('breakfast-items-list'),
    lunch: document.getElementById('lunch-items-list'),
    dinner: document.getElementById('dinner-items-list'),
    snack: document.getElementById('snack-items-list')
  };

  const mealTotalCalories = {
    breakfast: document.getElementById('breakfast-total-cals'),
    lunch: document.getElementById('lunch-total-cals'),
    dinner: document.getElementById('dinner-total-cals'),
    snack: document.getElementById('snack-total-cals')
  };

  // Modals
  const settingsModal = document.getElementById('settings-modal');
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
  const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
  const settingsForm = document.getElementById('settings-form');
  const calcMacrosAutoBtn = document.getElementById('calc-macros-auto-btn');

  const setTargetCalories = document.getElementById('set-target-calories');
  const setTargetProtein = document.getElementById('set-target-protein');
  const setTargetCarbs = document.getElementById('set-target-carbs');
  const setTargetFat = document.getElementById('set-target-fat');
  const setTargetWater = document.getElementById('set-target-water');

  const backupModal = document.getElementById('backup-modal');
  const openBackupBtn = document.getElementById('open-backup-btn');
  const closeBackupModalBtn = document.getElementById('close-backup-modal-btn');
  const closeBackupFooterBtn = document.getElementById('close-backup-footer-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const triggerImportBtn = document.getElementById('trigger-import-btn');
  const importFileInput = document.getElementById('import-file-input');
  const clearDayBtn = document.getElementById('clear-day-btn');
  const resetAllBtn = document.getElementById('reset-all-btn');

  const toastElement = document.getElementById('toast');

  // --- HELPER FUNCTIONS ---
  function getTodayFormatted() {
    const today = new Date();
    return formatDateKey(today);
  }

  function formatDateKey(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateKey(keyStr) {
    const [year, month, day] = keyStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDisplayDate(dateKey) {
    const date = parseDateKey(dateKey);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  function getRelativeDayLabel(dateKey) {
    const todayStr = getTodayFormatted();
    if (dateKey === todayStr) return 'Today';

    const cur = parseDateKey(dateKey);
    const today = parseDateKey(todayStr);
    const diffTime = cur.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    return dateKey;
  }

  function formatNumber(num) {
    return Number(num || 0).toLocaleString();
  }

  function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.remove('hidden');
    clearTimeout(toastElement.toastTimeout);
    toastElement.toastTimeout = setTimeout(() => {
      toastElement.classList.add('hidden');
    }, 3200);
  }

  // --- STORAGE FUNCTIONS ---
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        appState.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
        appState.days = parsed.days || {};
      } else {
        // First run: provide an informative sample breakfast item for today
        const todayStr = getTodayFormatted();
        appState.days[todayStr] = {
          water: 2,
          entries: [
            {
              id: 'sample_1',
              name: 'Rolled Oats with Berries & Honey',
              meal: 'breakfast',
              calories: 340,
              protein: 11,
              carbs: 62,
              fat: 5,
              serving: '1 bowl (60g oats)'
            }
          ]
        };
        saveData();
      }
    } catch (e) {
      console.error('Failed to parse stored data:', e);
      appState = { settings: { ...DEFAULT_SETTINGS }, days: {} };
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      showToast('Error saving data to browser storage!');
    }
  }

  function getDayData(dateKey) {
    if (!appState.days[dateKey]) {
      appState.days[dateKey] = {
        water: 0,
        entries: []
      };
    }
    return appState.days[dateKey];
  }

  // --- RENDER FUNCTIONS ---
  function renderAll() {
    renderDateHeader();
    renderDailyStats();
    renderMacros();
    renderWater();
    renderMealLists();
    renderMiniChart();
  }

  function renderDateHeader() {
    datePicker.value = currentDate;
    dateString.textContent = formatDisplayDate(currentDate);
    dateDisplayBadge.textContent = getRelativeDayLabel(currentDate);
  }

  function calculateDailyTotals(dateKey) {
    const day = getDayData(dateKey);
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      byMeal: {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0
      }
    };

    if (day && day.entries) {
      day.entries.forEach(entry => {
        const cal = Number(entry.calories) || 0;
        const p = Number(entry.protein) || 0;
        const c = Number(entry.carbs) || 0;
        const f = Number(entry.fat) || 0;

        totals.calories += cal;
        totals.protein += p;
        totals.carbs += c;
        totals.fat += f;

        if (totals.byMeal[entry.meal] !== undefined) {
          totals.byMeal[entry.meal] += cal;
        }
      });
    }

    // Round macros to 1 decimal place
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;
    totals.fat = Math.round(totals.fat * 10) / 10;

    return totals;
  }

  function renderDailyStats() {
    const totals = calculateDailyTotals(currentDate);
    const goal = Number(appState.settings.targetCalories) || 2000;
    const remaining = goal - totals.calories;
    const percentage = goal > 0 ? Math.round((totals.calories / goal) * 100) : 0;

    statGoalCalories.textContent = `${formatNumber(goal)} kcal`;
    statEatenCalories.textContent = `${formatNumber(totals.calories)} kcal`;
    statProgressPct.textContent = `${percentage}%`;

    // SVG Gauge calculation
    // Circle radius = 68, circumference = 2 * PI * 68 = ~427.26
    const circumference = 2 * Math.PI * 68;
    gaugeFillCircle.style.strokeDasharray = circumference;

    const progressRatio = Math.min(Math.max(totals.calories / goal, 0), 1);
    const strokeOffset = circumference - (circumference * progressRatio);
    gaugeFillCircle.style.strokeDashoffset = strokeOffset;

    // Linear bar calculation
    const linearPct = Math.min(percentage, 100);
    mainMeterFill.style.width = `${linearPct}%`;

    if (remaining >= 0) {
      caloriesRemainingNumber.textContent = formatNumber(remaining);
      caloriesRemainingLabel.textContent = 'kcal remaining';
      gaugeFillCircle.classList.remove('exceeded');
      mainMeterFill.classList.remove('exceeded');
      budgetStatusPill.textContent = 'On Track';
      budgetStatusPill.classList.remove('exceeded');
    } else {
      const overAmount = Math.abs(remaining);
      caloriesRemainingNumber.textContent = `+${formatNumber(overAmount)}`;
      caloriesRemainingLabel.textContent = 'kcal over budget';
      gaugeFillCircle.classList.add('exceeded');
      mainMeterFill.classList.add('exceeded');
      budgetStatusPill.textContent = 'Exceeded';
      budgetStatusPill.classList.add('exceeded');
    }
  }

  function renderMacros() {
    const totals = calculateDailyTotals(currentDate);
    const settings = appState.settings;

    // Protein
    proteinCurrent.textContent = totals.protein;
    proteinTarget.textContent = settings.targetProtein;
    const pRatio = Math.min((totals.protein / (settings.targetProtein || 1)) * 100, 100);
    proteinBarFill.style.width = `${pRatio}%`;
    proteinCalText.textContent = `${Math.round(totals.protein * 4)} kcal`;

    // Carbs
    carbsCurrent.textContent = totals.carbs;
    carbsTarget.textContent = settings.targetCarbs;
    const cRatio = Math.min((totals.carbs / (settings.targetCarbs || 1)) * 100, 100);
    carbsBarFill.style.width = `${cRatio}%`;
    carbsCalText.textContent = `${Math.round(totals.carbs * 4)} kcal`;

    // Fat
    fatCurrent.textContent = totals.fat;
    fatTarget.textContent = settings.targetFat;
    const fRatio = Math.min((totals.fat / (settings.targetFat || 1)) * 100, 100);
    fatBarFill.style.width = `${fRatio}%`;
    fatCalText.textContent = `${Math.round(totals.fat * 9)} kcal`;
  }

  function renderWater() {
    const day = getDayData(currentDate);
    const currentGlasses = day.water || 0;
    const targetGlasses = appState.settings.targetWater || 8;

    waterCount.textContent = currentGlasses;
    waterGoal.textContent = targetGlasses;
    waterMl.textContent = currentGlasses * 250;

    waterGlassesContainer.innerHTML = '';
    const displayGlassesCount = Math.max(targetGlasses, currentGlasses);

    for (let i = 1; i <= displayGlassesCount; i++) {
      const glass = document.createElement('div');
      glass.className = `water-cup-item ${i <= currentGlasses ? 'filled' : ''}`;
      glass.title = `Glass ${i} (250ml)`;
      glass.setAttribute('data-glass-index', i);
      glass.addEventListener('click', () => {
        // Toggle or set to this index
        if (day.water === i) {
          day.water = i - 1;
        } else {
          day.water = i;
        }
        saveData();
        renderWater();
      });
      waterGlassesContainer.appendChild(glass);
    }
  }

  function renderMealLists() {
    const day = getDayData(currentDate);
    const totals = calculateDailyTotals(currentDate);

    // Update meal category sum badges
    Object.keys(mealTotalCalories).forEach(mealKey => {
      mealTotalCalories[mealKey].textContent = `${formatNumber(totals.byMeal[mealKey] || 0)} kcal`;
    });

    // Populate each category list
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealKey => {
      const container = mealItemLists[mealKey];
      container.innerHTML = '';

      const items = (day.entries || []).filter(e => e.meal === mealKey);

      if (items.length === 0) {
        container.innerHTML = '<div class="empty-meal-state">No foods logged yet for this meal.</div>';
        return;
      }

      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'meal-item-row';
        row.setAttribute('data-id', item.id);

        const macroParts = [];
        if (item.protein) macroParts.push(`P: ${item.protein}g`);
        if (item.carbs) macroParts.push(`C: ${item.carbs}g`);
        if (item.fat) macroParts.push(`F: ${item.fat}g`);
        const macroStr = macroParts.length > 0 ? macroParts.join(' • ') : '';

        row.innerHTML = `
          <div class="item-left">
            <span class="item-title">${escapeHtml(item.name)}</span>
            <div class="item-meta">
              ${item.serving ? `<span>${escapeHtml(item.serving)}</span>` : ''}
              ${macroStr ? `<span class="item-macro-tag">${macroStr}</span>` : ''}
            </div>
          </div>
          <div class="item-right">
            <span class="item-calories-val">${formatNumber(item.calories)} kcal</span>
            <div class="item-actions">
              <button class="item-action-btn btn-edit" title="Edit entry" data-action="edit" data-id="${item.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="item-action-btn btn-delete" title="Delete entry" data-action="delete" data-id="${item.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;

        container.appendChild(row);
      });
    });
  }

  function renderMiniChart() {
    miniChartBars.innerHTML = '';
    const curDateObj = parseDateKey(currentDate);
    const target = Number(appState.settings.targetCalories) || 2000;

    let totalCals7Days = 0;
    const daysData = [];

    // Last 7 days leading up to currentDate
    for (let i = 6; i >= 0; i--) {
      const d = new Date(curDateObj);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const t = calculateDailyTotals(key);
      daysData.push({
        dateKey: key,
        calories: t.calories,
        dayLabel: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
        fullDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
      totalCals7Days += t.calories;
    }

    const avg = Math.round(totalCals7Days / 7);
    chartAvgLabel.textContent = `7-Day Avg: ${formatNumber(avg)} kcal`;

    const maxChartValue = Math.max(target * 1.25, ...daysData.map(d => d.calories), 100);

    const todayKey = getTodayFormatted();

    daysData.forEach(item => {
      const col = document.createElement('div');
      col.className = `chart-col ${item.dateKey === currentDate ? 'is-selected' : ''} ${item.dateKey === todayKey ? 'is-today' : ''}`;
      col.title = `${item.fullDate}: ${formatNumber(item.calories)} kcal (Target: ${formatNumber(target)})`;

      const heightPct = Math.min(Math.round((item.calories / maxChartValue) * 100), 100);
      const isOver = item.calories > target;

      col.innerHTML = `
        <div class="chart-bar-wrap">
          <div class="chart-bar-fill ${isOver ? 'over' : ''}" style="height: ${heightPct}%"></div>
        </div>
        <span class="chart-col-label">${item.dayLabel}</span>
      `;

      col.addEventListener('click', () => {
        changeDate(item.dateKey);
      });

      miniChartBars.appendChild(col);
    });
  }

  function renderPresets() {
    presetChipsList.innerHTML = '';
    FOOD_PRESETS.forEach(preset => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip-btn';
      chip.textContent = `${preset.name} (${preset.calories} kcal)`;
      chip.addEventListener('click', () => {
        populateFormWithPreset(preset);
      });
      presetChipsList.appendChild(chip);
    });
  }

  function populateFormWithPreset(preset) {
    foodNameInput.value = preset.name;
    foodMealSelect.value = preset.meal;
    foodCaloriesInput.value = preset.calories;
    foodProteinInput.value = preset.protein || '';
    foodCarbsInput.value = preset.carbs || '';
    foodFatInput.value = preset.fat || '';
    foodServingInput.value = preset.serving || '';

    foodCaloriesInput.focus();
    showToast(`Loaded preset: ${preset.name}`);
  }

  // --- ACTIONS & HANDLERS ---
  function changeDate(newDateStr) {
    currentDate = newDateStr;
    renderAll();
  }

  function shiftDate(daysDelta) {
    const cur = parseDateKey(currentDate);
    cur.setDate(cur.getDate() + daysDelta);
    currentDate = formatDateKey(cur);
    renderAll();
  }

  function resetForm() {
    foodLogForm.reset();
    editEntryId.value = '';
    formCardTitle.textContent = 'Log Food Item';
    submitBtnLabel.textContent = 'Add to Log';
    cancelEditBtn.classList.add('hidden');
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const name = foodNameInput.value.trim();
    const meal = foodMealSelect.value;
    const calories = Math.round(Number(foodCaloriesInput.value));
    const protein = foodProteinInput.value ? parseFloat(foodProteinInput.value) : 0;
    const carbs = foodCarbsInput.value ? parseFloat(foodCarbsInput.value) : 0;
    const fat = foodFatInput.value ? parseFloat(foodFatInput.value) : 0;
    const serving = foodServingInput.value.trim();
    const editingId = editEntryId.value;

    if (!name || isNaN(calories) || calories < 0) {
      showToast('Please enter a valid food name and calories.');
      return;
    }

    const day = getDayData(currentDate);

    if (editingId) {
      // Update existing item
      const index = day.entries.findIndex(entry => entry.id === editingId);
      if (index !== -1) {
        day.entries[index] = {
          id: editingId,
          name,
          meal,
          calories,
          protein,
          carbs,
          fat,
          serving
        };
        showToast(`Updated "${name}"`);
      }
    } else {
      // Create new item
      const newItem = {
        id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name,
        meal,
        calories,
        protein,
        carbs,
        fat,
        serving
      };
      day.entries.push(newItem);
      showToast(`Added "${name}" (${calories} kcal)`);
    }

    saveData();
    resetForm();
    renderAll();
  }

  function startEditItem(id) {
    const day = getDayData(currentDate);
    const item = day.entries.find(e => e.id === id);
    if (!item) return;

    editEntryId.value = item.id;
    foodNameInput.value = item.name;
    foodMealSelect.value = item.meal;
    foodCaloriesInput.value = item.calories;
    foodProteinInput.value = item.protein !== undefined ? item.protein : '';
    foodCarbsInput.value = item.carbs !== undefined ? item.carbs : '';
    foodFatInput.value = item.fat !== undefined ? item.fat : '';
    foodServingInput.value = item.serving || '';

    formCardTitle.textContent = 'Edit Food Item';
    submitBtnLabel.textContent = 'Update Item';
    cancelEditBtn.classList.remove('hidden');

    foodNameInput.focus();
    foodLogForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function deleteItem(id) {
    const day = getDayData(currentDate);
    const index = day.entries.findIndex(e => e.id === id);
    if (index !== -1) {
      const removed = day.entries.splice(index, 1)[0];
      saveData();
      renderAll();
      showToast(`Removed "${removed.name}"`);
    }
  }

  function autoSplitMacros() {
    const cals = Number(setTargetCalories.value) || 2000;
    // Standard balanced distribution: 30% Protein, 45% Carbs, 25% Fat
    // 4 kcal per gram of protein and carbs, 9 kcal per gram of fat
    const pGrams = Math.round((cals * 0.30) / 4);
    const cGrams = Math.round((cals * 0.45) / 4);
    const fGrams = Math.round((cals * 0.25) / 9);

    setTargetProtein.value = pGrams;
    setTargetCarbs.value = cGrams;
    setTargetFat.value = fGrams;

    showToast('Auto-split applied: 30% Protein / 45% Carbs / 25% Fat');
  }

  function openSettings() {
    setTargetCalories.value = appState.settings.targetCalories;
    setTargetProtein.value = appState.settings.targetProtein;
    setTargetCarbs.value = appState.settings.targetCarbs;
    setTargetFat.value = appState.settings.targetFat;
    setTargetWater.value = appState.settings.targetWater;
    settingsModal.classList.remove('hidden');
  }

  function closeSettings() {
    settingsModal.classList.add('hidden');
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    appState.settings.targetCalories = Math.round(Number(setTargetCalories.value));
    appState.settings.targetProtein = Math.round(Number(setTargetProtein.value));
    appState.settings.targetCarbs = Math.round(Number(setTargetCarbs.value));
    appState.settings.targetFat = Math.round(Number(setTargetFat.value));
    appState.settings.targetWater = Math.max(1, Math.round(Number(setTargetWater.value)));

    saveData();
    closeSettings();
    renderAll();
    showToast('Nutrition targets saved successfully!');
  }

  function openBackupModal() {
    backupModal.classList.remove('hidden');
  }

  function closeBackupModal() {
    backupModal.classList.add('hidden');
  }

  function exportData() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `nutritrack_backup_${getTodayFormatted()}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup file downloaded!');
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && (imported.settings || imported.days)) {
          appState.settings = { ...DEFAULT_SETTINGS, ...(imported.settings || {}) };
          appState.days = imported.days || {};
          saveData();
          renderAll();
          closeBackupModal();
          showToast('Data imported successfully!');
        } else {
          showToast('Invalid backup file format.');
        }
      } catch (err) {
        showToast('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  }

  function clearSelectedDay() {
    if (confirm(`Are you sure you want to delete all entries for ${formatDisplayDate(currentDate)}?`)) {
      if (appState.days[currentDate]) {
        appState.days[currentDate] = { water: 0, entries: [] };
        saveData();
        renderAll();
        closeBackupModal();
        showToast('Cleared logs for this day.');
      }
    }
  }

  function wipeAllData() {
    if (confirm('CAUTION: This will delete ALL logged history, dates, and custom targets from your browser. Continue?')) {
      localStorage.removeItem(STORAGE_KEY);
      appState = {
        settings: { ...DEFAULT_SETTINGS },
        days: {}
      };
      saveData();
      renderAll();
      closeBackupModal();
      showToast('All stored data wiped clean.');
    }
  }

  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- EVENT LISTENERS ---
  function initEventListeners() {
    // Date Pickers
    datePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        changeDate(e.target.value);
      }
    });

    prevDayBtn.addEventListener('click', () => shiftDate(-1));
    nextDayBtn.addEventListener('click', () => shiftDate(1));

    // Form
    foodLogForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetForm);

    // Quick presets toggle
    quickPresetToggleBtn.addEventListener('click', () => {
      quickPresetsDrawer.classList.toggle('hidden');
    });

    // Meal quick add (+) buttons
    document.querySelectorAll('.btn-meal-quickadd').forEach(btn => {
      btn.addEventListener('click', () => {
        const mealCategory = btn.getAttribute('data-meal');
        foodMealSelect.value = mealCategory;
        foodNameInput.focus();
        foodLogForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    // Event delegation for Edit and Delete buttons on meal items
    document.querySelector('.meals-list-container').addEventListener('click', (e) => {
      const actionBtn = e.target.closest('.item-action-btn');
      if (!actionBtn) return;

      const action = actionBtn.getAttribute('data-action');
      const id = actionBtn.getAttribute('data-id');

      if (action === 'edit') {
        startEditItem(id);
      } else if (action === 'delete') {
        deleteItem(id);
      }
    });

    // Water quick buttons
    waterPlusBtn.addEventListener('click', () => {
      const day = getDayData(currentDate);
      day.water = (day.water || 0) + 1;
      saveData();
      renderWater();
    });

    waterMinusBtn.addEventListener('click', () => {
      const day = getDayData(currentDate);
      if (day.water && day.water > 0) {
        day.water -= 1;
        saveData();
        renderWater();
      }
    });

    // Settings Modal
    openSettingsBtn.addEventListener('click', openSettings);
    closeSettingsModalBtn.addEventListener('click', closeSettings);
    cancelSettingsBtn.addEventListener('click', closeSettings);
    settingsForm.addEventListener('submit', handleSaveSettings);
    calcMacrosAutoBtn.addEventListener('click', autoSplitMacros);

    // Backup & Data Modal
    openBackupBtn.addEventListener('click', openBackupModal);
    closeBackupModalBtn.addEventListener('click', closeBackupModal);
    closeBackupFooterBtn.addEventListener('click', closeBackupModal);
    exportJsonBtn.addEventListener('click', exportData);
    triggerImportBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleImportFile);
    clearDayBtn.addEventListener('click', clearSelectedDay);
    resetAllBtn.addEventListener('click', wipeAllData);

    // Close modals on overlay backdrop click
    [settingsModal, backupModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });

    // Keyboard Esc key to close open modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSettings();
        closeBackupModal();
      }
    });
  }

  // --- INITIALIZATION ---
  function init() {
    loadData();
    renderPresets();
    renderAll();
    initEventListeners();
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

