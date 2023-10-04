<?php
// Verifica se o método da requisição é POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Cria uma conexão com o banco de dados usando a extensão mysqli
    $conn = new mysqli('127.0.0.1', 'root', '', 'injection');

    // Verifica se houve algum erro ao conectar com o banco de dados
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Obtém os valores dos campos de usuário e senha do formulário
    $usuario = $_POST['usuario'];
    $senha = $_POST['senha'];

    // Monta a consulta SQL que verifica o usuário e a senha
    $query = "SELECT usuario, senha FROM usuario WHERE usuario='$usuario' AND senha='$senha'";

    // Executa a consulta no banco de dados
    $result = $conn->query($query);

    // Verifica se o resultado da consulta possui algum registro
    if ($result->num_rows > 0) {
        echo "Logado com sucesso";
    } else {
        echo "Não logou. Tente novamente.";
    }

    // Fecha a conexão com o banco de dados
    $conn->close();
}
?>

<!DOCTYPE html>
<html>

<head>
    <title>Demonstrando Injection</title>
</head>

<body>
    <!-- Formulário para demonstrar a vulnerabilidade de injeção de SQL -->
    <form action="index.php" method="POST">
        <h2>Demonstrando SQL Injection</h2><br>
        Usuário:<br>
        <input type="text" name="usuario"><br><br>
        Senha:<br>
        <input type="text" name="senha"><br><br>
        <input type="submit" value="Logar">
    </form>
</body>

</html>