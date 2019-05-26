import sheet from './db'

sheet.connect().then((sheet) => {
  // sheet.updateRow({ greek: 'ἀμην' }, { chapter: 1 })
  // sheet.save()
  console.log(sheet.where(word => word.revisionBox === 'every-day'))
})
