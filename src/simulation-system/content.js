export function validateSimulations(bank,review){
 const text=v=>typeof v==='string'&&v.trim().length>0;
 if(!bank||bank.lessonId!==review.id||!Array.isArray(bank.items)||!bank.items.length)throw Error('Simulation lesson mismatch or empty bank');
 const known=new Set(review.items.map(q=>q.id)),ids=new Set();
 for(const item of bank.items){
  if(!known.has(item.reviewId)||ids.has(item.reviewId)||!text(item.goal)||!text(item.professionalResponse)||!Array.isArray(item.points)||item.points.length!==4)throw Error('Invalid simulation: '+item.reviewId);
  ids.add(item.reviewId);const points=new Set();
  for(const p of item.points){if(!text(p.id)||points.has(p.id)||!text(p.title)||!text(p.explanation)||!text(p.sentence))throw Error('Invalid speaking point');points.add(p.id);}
 }
 return bank;
}
export function composeGuide(simulation,selected){
 const ids=new Set(selected);return simulation.points.filter(p=>ids.has(p.id)).map(p=>p.sentence).join('\n\n');
}
