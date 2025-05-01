const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'cardealz_secret_key';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao banco de dados
const db = new sqlite3.Database('./CarDealz.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
    initializeDatabase();
  }
});

// Inicializar banco de dados
function initializeDatabase() {
  // Criar tabela de usuários
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela de usuários:', err.message);
    } else {
      console.log('Tabela de usuários pronta');
      
      // Verificar se existe um usuário admin
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row) => {
        if (err) {
          console.error('Erro ao verificar usuário admin:', err.message);
        } else if (row.count === 0) {
          // Criar usuário admin padrão
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          db.run(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            ["admin", "admin@cardealz.com", hashedPassword, "admin"],
            function(err) {
              if (err) {
                console.error('Erro ao criar usuário admin:', err.message);
              } else {
                console.log('Usuário admin criado com sucesso');
              }
            }
          );
        }
      });
    }
  });

  // Criar tabela de carros
  db.run(`CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    year TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    image TEXT,
    stock INTEGER DEFAULT 0,
    features TEXT,
    specifications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela de carros:', err.message);
    } else {
      console.log('Tabela de carros pronta');
      
      // Verificar se existem carros
      db.get('SELECT COUNT(*) as count FROM cars', (err, row) => {
        if (err) {
          console.error('Erro ao verificar carros:', err.message);
        } else if (row.count === 0) {
          // Adicionar carros de demonstração
          addDemoCars();
        }
      });
    }
  });

  // Criar tabela de compras
  db.run(`CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    car_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (car_id) REFERENCES cars (id)
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela de compras:', err.message);
    } else {
      console.log('Tabela de compras pronta');
    }
  });
}

// Adicionar carros de demonstração
function addDemoCars() {
  const demoCars = [
    {
      name: 'Tesla Model S',
      brand: 'Tesla',
      year: '2023',
      price: 89990,
      description: 'The Tesla Model S is an all-electric five-door liftback sedan produced by Tesla, Inc. It features a dual motor all-wheel drive setup.',
      image: 'https://via.placeholder.com/400x300?text=Tesla+Model+S',
      stock: 5,
      features: JSON.stringify([
        'All-Electric',
        'Dual Motor',
        'Autopilot',
        'Long Range Battery',
        'Premium Interior'
      ]),
      specifications: JSON.stringify({
        engine: 'Dual Electric Motor',
        power: '670 hp',
        acceleration: '3.1 seconds (0-60 mph)',
        topSpeed: '155 mph',
        range: '405 miles',
        transmission: 'Single-Speed',
        drivetrain: 'All-Wheel Drive'
      })
    },
    {
      name: 'BMW i8',
      brand: 'BMW',
      year: '2022',
      price: 147500,
      description: 'The BMW i8 is a plug-in hybrid sports car developed by BMW. It features a turbocharged 1.5-liter 3-cylinder engine paired with an electric motor.',
      image: 'https://via.placeholder.com/400x300?text=BMW+i8',
      stock: 3,
      features: JSON.stringify([
        'Plug-in Hybrid',
        'Scissor Doors',
        'Carbon Fiber Construction',
        'LED Headlights',
        'Sport Mode'
      ]),
      specifications: JSON.stringify({
        engine: '1.5L Turbo 3-Cylinder + Electric Motor',
        power: '369 hp (combined)',
        acceleration: '4.2 seconds (0-60 mph)',
        topSpeed: '155 mph',
        range: '18 miles (electric only)',
        transmission: '6-Speed Automatic',
        drivetrain: 'All-Wheel Drive'
      })
    },
    {
      name: 'Audi e-tron GT',
      brand: 'Audi',
      year: '2023',
      price: 102400,
      description: 'The Audi e-tron GT is an all-electric grand tourer manufactured by Audi. It shares its platform with the Porsche Taycan.',
      image: 'https://via.placeholder.com/400x300?text=Audi+e-tron+GT',
      stock: 2,
      features: JSON.stringify([
        'All-Electric',
        'Quattro All-Wheel Drive',
        'Adaptive Air Suspension',
        'Matrix LED Headlights',
        'Bang & Olufsen Sound System'
      ]),
      specifications: JSON.stringify({
        engine: 'Dual Electric Motor',
        power: '522 hp',
        acceleration: '3.9 seconds (0-60 mph)',
        topSpeed: '152 mph',
        range: '238 miles',
        transmission: 'Single-Speed',
        drivetrain: 'All-Wheel Drive'
      })
    },
    {
      name: 'Mercedes-Benz EQS',
      brand: 'Mercedes',
      year: '2022',
      price: 102310,
      description: 'The Mercedes-Benz EQS is an all-electric luxury sedan produced by Mercedes-Benz. It is the electric equivalent of the S-Class.',
      image: 'https://via.placeholder.com/400x300?text=Mercedes+EQS',
      stock: 4,
      features: JSON.stringify([
        'All-Electric',
        'MBUX Hyperscreen',
        'Rear-Wheel Steering',
        'Burmester 3D Sound System',
        'Energizing Comfort'
      ]),
      specifications: JSON.stringify({
        engine: 'Single/Dual Electric Motor',
        power: '516 hp',
        acceleration: '4.1 seconds (0-60 mph)',
        topSpeed: '130 mph',
        range: '350 miles',
        transmission: 'Single-Speed',
        drivetrain: 'All-Wheel Drive'
      })
    },
    {
      name: 'Porsche Taycan',
      brand: 'Porsche',
      year: '2023',
      price: 86700,
      description: 'The Porsche Taycan is an all-electric car manufactured by Porsche. It is Porsche\'s first all-electric car.',
      image: 'https://via.placeholder.com/400x300?text=Porsche+Taycan',
      stock: 6,
      features: JSON.stringify([
        'All-Electric',
        'Performance Battery Plus',
        'Adaptive Air Suspension',
        'Porsche Active Suspension Management',
        'Sport Chrono Package'
      ]),
      specifications: JSON.stringify({
        engine: 'Dual Electric Motor',
        power: '562 hp',
        acceleration: '3.8 seconds (0-60 mph)',
        topSpeed: '155 mph',
        range: '225 miles',
        transmission: 'Single-Speed',
        drivetrain: 'All-Wheel Drive'
      })
    }
  ];

  const stmt = db.prepare('INSERT INTO cars (name, brand, year, price, description, image, stock, features, specifications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  demoCars.forEach(car => {
    stmt.run(
      car.name,
      car.brand,
      car.year,
      car.price,
      car.description,
      car.image,
      car.stock,
      car.features,
      car.specifications
    );
  });
  
  stmt.finalize();
  console.log('Carros de demonstração adicionados ao banco de dados');
}

// Middleware para verificar token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
}

// Middleware para verificar se o usuário é admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador' });
  }
  next();
}

// Rotas de API

// Autenticação
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Nome de usuário ou email já existe' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      const token = jwt.sign(
        { id: this.lastID, username, email, role: 'user' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        token,
        user: { id: this.lastID, username, email, role: 'user' }
      });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (!user) return res.status(401).json({ error: 'Email ou senha incorretos' });
      
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) return res.status(401).json({ error: 'Email ou senha incorretos' });
      
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login bem-sucedido',
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    }
  );
});

// Carros
app.get('/api/cars', (req, res) => {
  db.all("SELECT * FROM cars", [], (err, cars) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Converter features e specifications de JSON para objetos
    const formattedCars = cars.map(car => ({
      ...car,
      features: JSON.parse(car.features || '[]'),
      specifications: JSON.parse(car.specifications || '{}')
    }));
    
    res.json(formattedCars);
  });
});

app.get('/api/cars/:id', (req, res) => {
  db.get("SELECT * FROM cars WHERE id = ?", [req.params.id], (err, car) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!car) return res.status(404).json({ error: 'Carro não encontrado' });
    
    // Converter features e specifications de JSON para objetos
    car.features = JSON.parse(car.features || '[]');
    car.specifications = JSON.parse(car.specifications || '{}');
    
    res.json(car);
  });
});

// Rotas protegidas (requerem autenticação)
app.post('/api/cars', authenticateToken, isAdmin, (req, res) => {
  const { name, brand, year, price, description, image, stock, features, specifications } = req.body;
  
  if (!name || !brand || !year || !price) {
    return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
  }
  
  db.run(
    `INSERT INTO cars (name, brand, year, price, description, image, stock, features, specifications)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      brand,
      year,
      price,
      description || '',
      image || '',
      stock || 0,
      JSON.stringify(features || []),
      JSON.stringify(specifications || {})
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      res.status(201).json({
        id: this.lastID,
        message: 'Carro adicionado com sucesso'
      });
    }
  );
});

app.put('/api/cars/:id', authenticateToken, isAdmin, (req, res) => {
  const { name, brand, year, price, description, image, stock, features, specifications } = req.body;
  
  if (!name || !brand || !year || !price) {
    return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
  }
  
  db.run(
    `UPDATE cars SET
     name = ?,
     brand = ?,
     year = ?,
     price = ?,
     description = ?,
     image = ?,
     stock = ?,
     features = ?,
     specifications = ?
     WHERE id = ?`,
    [
      name,
      brand,
      year,
      price,
      description || '',
      image || '',
      stock || 0,
      JSON.stringify(features || []),
      JSON.stringify(specifications || {}),
      req.params.id
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Carro não encontrado' });
      }
      
      res.json({ message: 'Carro atualizado com sucesso' });
    }
  );
});

app.delete('/api/cars/:id', authenticateToken, isAdmin, (req, res) => {
  db.run("DELETE FROM cars WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }
    
    res.json({ message: 'Carro excluído com sucesso' });
  });
});

// Compras
app.post('/api/purchase', authenticateToken, (req, res) => {
  const { carId, quantity } = req.body;
  const userId = req.user.id;
  
  if (!carId || !quantity) {
    return res.status(400).json({ error: 'ID do carro e quantidade são obrigatórios' });
  }
  
  // Verificar se o carro existe e tem estoque suficiente
  db.get("SELECT * FROM cars WHERE id = ?", [carId], (err, car) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!car) return res.status(404).json({ error: 'Carro não encontrado' });
    
    if (car.stock < quantity) {
      return res.status(400).json({ error: 'Estoque insuficiente' });
    }
    
    // Iniciar transação
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      
      // Atualizar estoque
      db.run(
        "UPDATE cars SET stock = stock - ? WHERE id = ?",
        [quantity, carId],
        function(err) {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }
          
          // Registrar compra
          const total = car.price * quantity;
          db.run(
            "INSERT INTO purchases (user_id, car_id, quantity, price) VALUES (?, ?, ?, ?)",
            [userId, carId, quantity, total],
            function(err) {
              if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
              }
              
              db.run("COMMIT");
              res.status(201).json({
                message: 'Compra realizada com sucesso',
                purchaseId: this.lastID,
                total
              });
            }
          );
        }
      );
    });
  });
});

app.get('/api/purchases', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  
  // Administradores podem ver todas as compras, usuários comuns apenas as suas
  const query = isAdmin
    ? `SELECT p.*, u.username, c.name as car_name, c.brand as car_brand, c.image as car_image
       FROM purchases p
       JOIN users u ON p.user_id = u.id
       JOIN cars c ON p.car_id = c.id
       ORDER BY p.purchase_date DESC`
    : `SELECT p.*, c.name as car_name, c.brand as car_brand, c.image as car_image
       FROM purchases p
       JOIN cars c ON p.car_id = c.id
       WHERE p.user_id = ?
       ORDER BY p.purchase_date DESC`;
  
  const params = isAdmin ? [] : [userId];
  
  db.all(query, params, (err, purchases) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(purchases);
  });
});

// Servir arquivos estáticos para todas as outras rotas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Fechar conexão com o banco de dados quando o servidor for encerrado
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conexão com o banco de dados fechada');
    process.exit(0);
  });
});