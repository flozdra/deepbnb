const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const AWS = require('aws-sdk')
const uuid = require('uuid')
const { json2csv } = require('json-2-csv')

const jwt = require('jsonwebtoken')
const app = require('express')()

const { MongoClient } = require('mongodb')

AWS.config.update({ region: 'us-east-1' })

const sqs = new AWS.SQS()
let predictQueueUrl = ''
let resultQueueUrl = ''

sqs.listQueues(
  {
    MaxResults: 10,
  },
  function (err, data) {
    if (err) console.log(err, err.stack)
    // an error occurred
    else {
      predictQueueUrl = data.QueueUrls.find((q) => q.toLowerCase().includes('predict'))
      resultQueueUrl = data.QueueUrls.find((q) => q.toLowerCase().includes('result'))
      console.log('Successfully found AWS queues')
    }
  }
)

let bucketName = ''
const s3 = new AWS.S3()
s3.listBuckets(function (err, data) {
  if (err) console.log(err, err.stack)
  // an error occurred
  else {
    bucketName = data.Buckets[0].Name
    console.log('Successfully found AWS bucket')
  }
})

let client = null
let db = null

async function connectDb() {
  const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DATABASE}`
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log('connecting...')
  await client.connect()
  console.log('connected!')
  db = client.db(process.env.MONGO_DATABASE)
  return true
}

async function checkConnection() {
  if (client?.topology?.isConnected()) return true
  await connectDb()
}

function verifyToken(req) {
  const decoded = jwt.verify(req.cookies['auth._token'], process.env.JWT_SECRET_KEY)
  req.user = decoded.data
}

function unauthorized(res) {
  res.cookie('auth._token', 'null')
  res.cookie('XSRF-TOKEN', 'null', { expires: new Date() })
  return res.status(403).json({ message: 'Unauthorized!' })
}

function serverError(res, e) {
  // eslint-disable-next-line no-console
  console.log(e)
  return res.status(500).json({ message: 'Internal server error' })
}

app.use(bodyParser.json())
app.use(cookieParser())

app.post('/login', async (req, res) => {
  try {
    await checkConnection()

    const user = await db.collection('users').findOne({
      username: req.body.username,
      password: req.body.password,
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = await jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: {
          _id: user._id.toString(),
          username: user.username,
        },
      },
      process.env.JWT_SECRET_KEY
    )

    res.cookie('auth._token', token)
    res.cookie('XSRF-TOKEN', 'XSRF-TOKEN')
    return res.json({
      user: {
        _id: user._id.toString(),
        username: user.username,
      },
    })
  } catch (e) {
    return serverError(res, e)
  }
})

app.post('/logout', (req, res) => {
  res.cookie('auth._token', 'null')
  res.cookie('XSRF-TOKEN', 'null', { expires: new Date() })
  return res.json()
})

app.get('/user', async (req, res) => {
  try {
    try {
      await checkConnection()
      verifyToken(req)
    } catch {
      return unauthorized(res)
    }

    return res.json({ user: req.user })
  } catch (e) {
    return serverError(res, e)
  }
})

app.get('/housing', async (req, res) => {
  try {
    await checkConnection()

    const housing = await db.collection('housing').find().toArray()

    // const housingResponse = []
    // for (const h of housing) {
    //   housingResponse.push(formatHousing(h))
    // }
    return res.json(housing)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/predict', (req, res) => {
  const filename = uuid.v4() + '.csv'
  console.log(filename)

  const rows = [
    {
      'title': 'Maison chez Kamil à Dunières',
      // 'latitude': 'latitude',
      // 'longitude': 'longitude',
      'max_people_count': 4,
      'bedroom_count': 4,
      'property_type': 'Maison',
      'housing_type': 'Logement entier',
      'kitchen': 1,
      'internet': 1,
      'television': 1,
      'commodities': 1,
      'shampooing': 1,
      'heating': 1,
      'air_conditioning': 0,
      'washing_machine': 1,
      'dryer': 1,
      'parking': 0,
      'wifi': 1,
      'tv_decoder': 1,
      'breakfast': 0,
      'pets_allowed': 1,
      'for_kids': 0,
      'adapted_for_events': 0,
      'smoking': 0,
      'accessibility': 1,
      'elevator': 0,
      'fireplace': 0,
      'intercom': 0,
      'doorman': 0,
      'swimming_pool': 0,
      'jacuzzi': 0,
      'gym': 0,
      '24_hours_entry-24': 0,
      'hangers': 1,
      'iron': 1,
      'hair_dryer': 1,
      'workspace': 1,
      'smoke_detector': 1,
      'carbon_monoxide_detector': 0,
      'rescue_kit': 0,
      'safety_sheet': 0,
      'extinguisher': 0,
      'bedroom_lock': 0,
      'discount_week': 0,
      'discount_mounth': 0,
      'additional_traveler_cost': 0,
      'cleaning_cost': 0,
      'deposit': 200,
      'cancel_conditions': 'Flexibles',
      'description': 'Très belle maison chez Kamil à dunières dans la campagne',
      'minimum_stay': 1,
    },
  ]

  const options = {
    prependHeader: true,
    delimiter: {
      wrap: '"',
      field: ',',
      eol: '\n',
    },
    trimHeaderFields: true,
    trimFieldValues: true,
    checkSchemaDifferences: false,
  }
  json2csv(
    rows,
    function (err, csv) {
      if (err) {
        console.log('Error in csv file generation', err)
      } else {
        console.log('csv file is', csv)

        const params = {
          Bucket: bucketName,
          Key: 'predict_queue/' + filename,
          Body: csv,
          ContentType: 'application/octet-stream',
        }
        s3.putObject(params, function (err, data) {
          if (err) {
            console.log('Error at uploadCSVFileOnS3Bucket function', err)
          } else {
            console.log('File uploaded Successfully')
            console.log(data)

            const params = {
              // Remove DelaySeconds parameter and value for FIFO queues
              DelaySeconds: 10,
              MessageAttributes: {
                Prediction: {
                  StringValue: filename,
                  DataType: 'String',
                },
              },
              MessageBody: 'Prediction',
              QueueUrl: resultQueueUrl,
            }

            sqs.sendMessage(params, function (err, data) {
              if (err) {
                console.log('Error', err)
              } else {
                console.log('Success', data.MessageId)
                return res.json()
              }
            })
          }
        })
      }
    },
    options
  )
})
module.exports = app

const FRENCH_COLUMNS = {
  'PrixNuitee': 'price',
  'Titre': 'title',
  'Latitude': 'latitude',
  'Longitude': 'longitude',
  'Capacite_accueil': 'max_people_count',
  'NbChambres': 'bedroom_count',
  'Type_logement': 'housing_type',
  'type_propriete': 'property_type',
  'Cuisine': 'kitchen',
  'Internet': 'internet',
  'television': 'television',
  'produits_base': 'commodities',
  'Shampooing': 'shampooing',
  'Chauffage': 'heating',
  'Climatisation': 'air_conditioning',
  'machine_laver': 'washing_machine',
  'seche_linge': 'dryer',
  'parking_sur-place': 'parking',
  'wifi': 'wifi',
  'television_cable': 'tv_decoder',
  'petit_dejeuner': 'breakfast',
  'animaux_acceptes': 'pets_allowed',
  'pourEnfants_famille': 'for_kids',
  'adapte_evenements': 'adapted_for_events',
  'logement_fumeur': 'smoking',
  'accessibilite': 'accessibility',
  'Ascenseur': 'elevator',
  'cheminee_interieur': 'fireplace',
  'Interphone': 'intercom',
  'Portier': 'doorman',
  'Piscine': 'swimming_pool',
  'Jacuzzi': 'jacuzzi',
  'salle_sport': 'gym',
  'Entree_24-24': '24_hours_entry',
  'Cintres': 'hangers',
  'fer_repasser': 'iron',
  'seche_cheveux': 'hair_dryer',
  'espace_travail_ordi': 'workspace',
  'detecteur_fumee': 'smoke_detector',
  'monoxyde_carbone_detect': 'carbon_monoxide_detector',
  'kit_secours': 'rescue_kit',
  'fiche_securite': 'safety_sheet',
  'extincteur': 'extinguisher',
  'porte_chambre_verrou': 'bedroom_lock',
  'rection_semaine': 'discount_week',
  'reduction_mois': 'discount_mounth',
  'surcout_voyageur_supp': 'additional_traveler_cost',
  'frais_menage': 'cleaning_cost',
  'Caution': 'deposit',
  'conditions_annulation': 'cancel_conditions',
  'Description': 'description',
  'duree_minimale_sejour': 'minimum_stay',
}

function formatHousing(item) {
  const formattedItem = {}
  for (const [key, newKey] of Object.entries(FRENCH_COLUMNS)) {
    formattedItem[newKey] = item[key]
  }
  return formattedItem
}
