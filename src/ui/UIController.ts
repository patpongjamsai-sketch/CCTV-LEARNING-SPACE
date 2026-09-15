import { equipmentById } from '../data/equipment';
import { floor1Mission101, missionById } from '../data/missions';
import { questionById, questionsByEquipment } from '../data/questions';
import type { EvaluationResult, MissionEngine } from '../simulation/MissionEngine';
import type { GameStore } from '../simulation/GameState';

interface UICallbacks {
  resume: () => void;
  reset: () => void;
  evaluate: () => EvaluationResult;
  close: () => void;
}

export class UIController {
  private readonly panels: HTMLElement[];
  private toastTimer = 0;

  constructor(
    private readonly store: GameStore,
    private readonly mission: MissionEngine,
    private readonly callbacks: UICallbacks,
  ) {
    this.panels = ['inspectorPanel', 'previewPanel', 'inventoryPanel', 'missionPanel', 'pausePanel', 'resultPanel'].map((id) => this.el(id));
    document.querySelectorAll<HTMLElement>('[data-close-panel]').forEach((button) => {
      button.addEventListener('click', () => this.closePanels());
    });
    this.el('resumeButton').addEventListener('click', () => {
      this.closePanels(false);
      this.callbacks.resume();
    });
    this.el('resetButton').addEventListener('click', this.callbacks.reset);
    this.el('previewMissionButton').addEventListener('click', () => this.openMission());
    this.el('missionContent').addEventListener('click', (event) => this.handleMissionClick(event));
    this.el('inspectorContent').addEventListener('click', (event) => this.handleQuestionClick(event));
    this.store.subscribe(() => this.refreshHud());
    this.refreshHud();
  }

  get hasOpenPanel(): boolean {
    return this.panels.some((panel) => !panel.hidden);
  }

  showStart(): void {
    this.el('loadingScreen').hidden = true;
    this.el('startScreen').hidden = false;
  }

  startHud(): void {
    this.el('startScreen').hidden = true;
    this.el('hud').hidden = false;
    this.refreshHud();
  }

  setPrompt(html: string | null): void {
    const prompt = this.el('interactionPrompt');
    prompt.hidden = !html;
    prompt.innerHTML = html ?? '';
  }

  setRoom(name: string): void {
    this.el('roomStatus').textContent = name;
  }

  openInspector(equipmentId: string): void {
    const item = equipmentById.get(equipmentId);
    if (!item) return;
    this.callbacks.close();
    this.closePanels(false);
    const question = questionsByEquipment.get(equipmentId);
    const specs = Object.entries(item.specifications)
      .map(([key, value]) => `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(String(value))}</td></tr>`).join('');
    this.el('inspectorContent').innerHTML = `
      <span class="panel-kicker">E · EQUIPMENT INSPECTOR</span>
      <h2 id="inspectorTitle">${escapeHtml(item.name)}</h2>
      <p class="panel-intro">${escapeHtml(item.description)}</p>
      <div class="equipment-summary">
        <div class="info-card"><b>หมวด</b><p>${escapeHtml(item.category)} · ระบบ ${escapeHtml(item.system)}</p></div>
        <div class="info-card"><b>Connector</b><p>${escapeHtml(item.connectors.join(', '))}</p></div>
      </div>
      <table class="spec-table"><tbody>${specs}</tbody></table>
      <p class="training-price">ราคาเพื่อการฝึก ${item.trainingPrice.toLocaleString('th-TH')} บาท</p>
      ${question ? this.questionMarkup(question.id) : '<p class="panel-intro">อุปกรณ์เสริมสำหรับสำรวจ — ไม่มีคำถามบังคับในรอบนี้</p>'}`;
    this.el('inspectorPanel').hidden = false;
  }

  openInventory(): void {
    this.callbacks.close();
    this.closePanels(false);
    const entries = Object.values(this.store.snapshot.inventory);
    this.el('inventoryContent').innerHTML = entries.length
      ? `<div class="inventory-grid">${entries.map((entry) => {
          const item = equipmentById.get(entry.equipmentId);
          return `<div class="inventory-item"><strong>${escapeHtml(item?.name ?? entry.equipmentId)}</strong><span>จำนวน ${entry.quantity} · สภาพ ${escapeHtml(entry.condition)}</span></div>`;
        }).join('')}</div>`
      : '<div class="empty-state">กระเป๋ายังว่าง เล็งอุปกรณ์ที่หยิบได้แล้วกด F</div>';
    this.el('inventoryPanel').hidden = false;
  }

  openCoveragePreview(): void {
    this.mission.recordAction('test:r102:coverage_preview');
    this.callbacks.close();
    this.closePanels(false);
    this.el('previewPanel').hidden = false;
    this.refreshHud();
  }

  openMission(): void {
    this.callbacks.close();
    this.closePanels(false);
    this.renderMission();
    this.el('missionPanel').hidden = false;
  }

  openPause(): void {
    if (this.hasOpenPanel) return;
    this.callbacks.close();
    this.el('pausePanel').hidden = false;
  }

  showResult(result: EvaluationResult): void {
    this.callbacks.close();
    this.closePanels(false);
    const breakdown = result.breakdown;
    const definition = missionById.get(this.store.snapshot.currentMission) ?? floor1Mission101;
    const nextRoom = definition.nextMission ? definition.room + 1 : null;
    this.el('resultContent').innerHTML = `
      <div class="result-score">${breakdown.total}<small>/100</small></div>
      <h3>${result.passed ? `ผ่านภารกิจ${nextRoom ? ` — Room ${nextRoom} ปลดล็อกแล้ว` : ''}` : 'ยังไม่ผ่าน ลองปรับคำตอบแล้วประเมินใหม่'}</h3>
      <p class="result-message">${result.missingCore ? `ยังมี Objective หลักของ ${definition.title} ไม่ครบ` : 'ระบบบันทึกคะแนนรอบล่าสุดและคะแนนสูงสุดแล้ว'}<br>คะแนนนี้เป็นผลฝึกปฏิบัติ ไม่ใช่คะแนนผ่านหน่วยอย่างเป็นทางการ</p>
      <div class="result-actions"><button id="resultContinue" class="primary-button" type="button">กลับไปฝึกต่อ</button><button id="resultMission" class="secondary-button" type="button">ดู Mission</button></div>`;
    this.el('resultPanel').hidden = false;
    this.el('resultContinue').addEventListener('click', () => { this.closePanels(false); this.callbacks.resume(); });
    this.el('resultMission').addEventListener('click', () => this.openMission());
  }

  closePanels(resume = true): void {
    this.panels.forEach((panel) => { panel.hidden = true; });
    this.el('budgetStatus').hidden = true;
    if (resume) this.callbacks.resume();
  }

  toast(message: string): void {
    const toast = this.el('toast');
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  }

  setDebug(text: string, visible: boolean): void {
    const panel = this.el('debugPanel');
    panel.hidden = !visible;
    panel.textContent = text;
  }

  private renderMission(): void {
    const state = this.store.snapshot;
    const definition = missionById.get(state.currentMission) ?? floor1Mission101;
    const score = this.mission.getScore();
    this.el('missionTitle').textContent = `${definition.id} ${definition.title}`;
    const intro = this.el('missionPanel').querySelector<HTMLElement>('.panel-intro');
    if (intro) intro.textContent = definition.description;
    const objectives = definition.objectives.filter((objective) => objective.required)
      .map((objective) => `<div class="objective-row ${state.completedObjectives.includes(objective.id) ? 'complete' : ''}">${escapeHtml(objective.label)}</div>`).join('');
    const challenges = definition.objectives.flatMap((objective) => objective.questionId ? [objective.questionId] : []).map((id) => {
      const question = questionById.get(id)!;
      const complete = state.answers[id]?.correct;
      return `<div class="challenge-card"><strong>${complete ? '✓ ' : ''}${escapeHtml(question.prompt)}</strong><small>${question.points} คะแนน</small><button class="challenge-button" data-question="${id}" type="button">${complete ? 'ทบทวนคำตอบ' : 'เปิดโจทย์'}</button></div>`;
    }).join('');
    this.el('missionContent').innerHTML = `
      <div class="mission-layout"><div><h3>Objective หลัก</h3><div class="objective-list">${objectives}</div></div><div><h3>โจทย์วิเคราะห์</h3><div class="challenge-list">${challenges}</div></div></div>
      ${scoreMarkup(score, definition.id)}
      <button class="primary-button evaluation-button" data-evaluate type="button">ประเมินผลภารกิจ (ผ่านที่ 70 คะแนน)</button>`;
  }

  private handleMissionClick(event: Event): void {
    const target = event.target as HTMLElement;
    const questionId = target.dataset.question;
    if (questionId) {
      this.el('budgetStatus').hidden = questionId !== 'q_budget';
      this.el('missionContent').insertAdjacentHTML('beforeend', `<div id="missionQuestion">${this.questionMarkup(questionId)}</div>`);
      target.closest('.challenge-button')?.setAttribute('disabled', 'true');
    }
    if (target.dataset.evaluate !== undefined) this.showResult(this.callbacks.evaluate());
    this.handleQuestionClick(event);
  }

  private handleQuestionClick(event: Event): void {
    const target = event.target as HTMLElement;
    const questionId = target.dataset.answerQuestion;
    const selected = target.dataset.answerIndex;
    if (questionId && selected !== undefined) {
      const answer = this.mission.answerQuestion(questionId, Number(selected));
      const box = target.closest('.question-box');
      const feedback = box?.querySelector<HTMLElement>('.answer-feedback');
      if (feedback && answer) {
        feedback.hidden = false;
        feedback.classList.toggle('wrong', !answer.correct);
        feedback.textContent = `${answer.correct ? 'ถูกต้อง' : 'ยังไม่ถูก'} — ${answer.explanation}`;
      }
      if (this.el('missionPanel').hidden === false) this.refreshHud();
    }
    const hintId = target.dataset.hint;
    if (hintId) this.toast(`คำใบ้: ${this.mission.useHint(hintId) ?? ''}`);
  }

  private questionMarkup(questionId: string): string {
    const question = questionById.get(questionId);
    if (!question) return '';
    return `<div class="question-box" data-question-box="${question.id}"><span class="panel-kicker">โจทย์วิเคราะห์ · ${question.points} คะแนน</span><h3>${escapeHtml(question.prompt)}</h3><div class="choice-list">${question.choices.map((choice, index) => `<button class="choice-button" data-answer-question="${question.id}" data-answer-index="${index}" type="button">${index + 1}. ${escapeHtml(choice)}</button>`).join('')}</div><div class="answer-feedback" hidden></div><button class="hint-button" data-hint="${question.id}" type="button">ขอคำใบ้ (มีผลต่อคะแนนแก้ปัญหา)</button></div>`;
  }

  private refreshHud(): void {
    const state = this.store.snapshot;
    const definition = missionById.get(state.currentMission) ?? floor1Mission101;
    const required = definition.objectives.filter((objective) => objective.required);
    const done = required.filter((objective) => state.completedObjectives.includes(objective.id)).length;
    this.el('hudMissionId').textContent = `MISSION ${definition.id}`;
    this.el('hudMissionTitle').textContent = definition.title;
    this.el('objectiveProgressText').textContent = `${done}/${required.length} เป้าหมายหลัก`;
    (this.el('objectiveProgressBar') as HTMLElement).style.width = `${(done / required.length) * 100}%`;
    this.el('hudScore').textContent = String(this.mission.getScore().total);
  }

  private el(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing UI element #${id}`);
    return element;
  }
}

function scoreMarkup(score: ReturnType<MissionEngine['getScore']>, missionId: string): string {
  const entries = missionId === 'F1-M102'
    ? [['ความรู้กล้อง', score.knowledge, 20], ['เลือกชนิดกล้อง', score.equipmentSelection, 30], ['ตำแหน่งติดตั้ง', score.connection, 30], ['แก้จุดบอด', score.problemSolving, 15], ['ครบภารกิจ', score.completion, 5]]
    : [['ความรู้', score.knowledge, 20], ['เลือกอุปกรณ์', score.equipmentSelection, 25], ['การเชื่อมต่อ', score.connection, 25], ['แก้ปัญหา', score.problemSolving, 15], ['งบประมาณ', score.budgetManagement, 10], ['ครบภารกิจ', score.completion, 5]];
  return `<div class="score-breakdown">${entries.map(([label, value, max]) => `<div><b>${value}/${max}</b><span>${label}</span></div>`).join('')}</div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}
