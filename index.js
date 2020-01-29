import testmodel from './testmodel';

async function operations() {
  await testmodel.connect()
  testmodel.updateRow(
    { categ: 'Food' },
    { amount: 15 }
  )
  testmodel.insertRow({
    date: 'date',
    amount: 987,
    type: 'test'
  })
  console.log(testmodel.getData())
  await testmodel.save()
  console.log(testmodel.getData())
}

operations()