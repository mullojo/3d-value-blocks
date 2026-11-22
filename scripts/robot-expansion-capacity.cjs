// Scenario calculator. Rates describe assumptions, not a current-model benchmark.
const fs = require('node:fs');
const path = require('node:path');
function calculate(input) {
  const positive = ['humanWordsPerMinute','charactersPerWord','charactersPerLine','aiTokensPerSecond','charactersPerToken','effectiveIndependentWorkers','calendarHoursPerDay','humanWorkdayHours'];
  for (const key of positive) if (!Number.isFinite(input[key]) || input[key] <= 0) throw new RangeError(`${key} must be positive`);
  for (const key of ['humanTypingDuty','aiGeneratingDuty','humanUsefulYield','aiUsefulYield']) {
    if (!Number.isFinite(input[key]) || input[key] <= 0 || input[key] > 1) throw new RangeError(`${key} must be in (0,1]`);
  }
  if (!Array.isArray(input.lineCounts) || !input.lineCounts.length || input.lineCounts.some(n => !Number.isSafeInteger(n) || n <= 0)) throw new RangeError('lineCounts must contain positive safe integers');
  const humanCharactersPerSecond = input.humanWordsPerMinute * input.charactersPerWord / 60;
  const aiCharactersPerSecond = input.aiTokensPerSecond * input.charactersPerToken;
  const humanEffective = humanCharactersPerSecond * input.humanTypingDuty * input.humanUsefulYield;
  const aiEffective = aiCharactersPerSecond * input.aiGeneratingDuty * input.aiUsefulYield * input.effectiveIndependentWorkers;
  return {
    humanCharactersPerSecond,
    aiCharactersPerSecond,
    rawEmissionRatio: aiCharactersPerSecond / humanCharactersPerSecond,
    equalWindowUsefulCapacityRatio: aiEffective / humanEffective,
    rows: input.lineCounts.map(lines => {
      const characters = lines * input.charactersPerLine;
      const humanTypingHours = characters / humanCharactersPerSecond / 3600;
      const humanElapsedHours = characters / humanEffective / 3600;
      const aiElapsedHours = characters / aiEffective / 3600;
      return {
        lines, characters,
        asciiBytes: characters,
        kibibytesAssumingAscii: characters / 1024,
        mebibytesAssumingAscii: characters / 1024 ** 2,
        humanTypingHours,
        aiSingleStreamEmissionHours: characters / aiCharactersPerSecond / 3600,
        humanElapsedHours,
        humanCalendarDays: humanElapsedHours / input.calendarHoursPerDay,
        // Assumes the same typing duty within each human workday. This is a
        // separate schedule, not a calendar-day conversion of the previous row.
        humanScheduledWorkdays: humanTypingHours / input.humanUsefulYield / (input.humanWorkdayHours * input.humanTypingDuty),
        aiElapsedHours
      };
    })
  };
}
function fixedWorkloadGain(acceleratedRatio, serialFraction) {
  if (!Number.isFinite(acceleratedRatio) || acceleratedRatio <= 0 || !Number.isFinite(serialFraction) || serialFraction < 0 || serialFraction > 1) throw new RangeError('Invalid accelerated ratio or serial fraction');
  return 1 / (serialFraction + (1 - serialFraction) / acceleratedRatio);
}
if (require.main === module) {
  const file = process.argv[2] || path.join(__dirname, '../docs/value-block-records/expansion-capacity-model.json');
  console.log(JSON.stringify(calculate(JSON.parse(fs.readFileSync(file, 'utf8'))), null, 2));
}
module.exports = { calculate, fixedWorkloadGain };
