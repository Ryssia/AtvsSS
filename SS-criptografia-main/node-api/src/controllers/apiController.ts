import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Função para gerar senha aleatória
const generateRandomPassword = () => {
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return randomBytes;
};

export const ping = (req: Request, res: Response) => {
    res.json({ pong: true });
}

export const register = async (req: Request, res: Response) => {
    const { email, password, name, discipline } = req.body;

    // Validação de campos usando express-validator
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (email && password && name && discipline) {
        let hasUser = await User.findOne({ where: { email } });
        if (!hasUser) {
            // Gera uma senha aleatória
            const randomPassword = generateRandomPassword();

            // Criptografa a senha aleatória antes de armazená-la
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Cria o usuário com a senha criptografada
            let newUser = await User.create({ email, password: hashedPassword, name, discipline });

            // Configuração do transporte de e-mail usando Nodemailer
            const transporter = nodemailer.createTransport({
                host: 'sandbox.smtp.mailtrap.io',
                port: 2525,
                auth: {
                    user: '3c06f9dbdde467',
                    pass: 'b338ed92a62e61',
                },
            });

            // Montando as opções do e-mail
            const mailOptions = {
                from: 'seu-email@dominio.com',
                to: email,
                subject: 'Cadastro de Usuário',
                text: `Seu usuário foi criado com sucesso. Sua senha temporária é: ${randomPassword}`, // Enviando a senha temporária do usuário
            };

            // Enviando o e-mail
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erro ao enviar o e-mail:', error);
                    return res.status(500).json({ error: 'Ocorreu um erro ao enviar o e-mail.' });
                } else {
                    console.log('E-mail enviado:', info.response);
                    return res.status(201).json({ message: 'Usuário cadastrado com sucesso.', newUser });
                }
            });
        } else {
            return res.status(400).json({ error: 'E-mail já existe.' });
        }
    } else {
        return res.status(400).json({ error: 'E-mail e/ou senha não enviados.' });
    }
}

export const login = async (req: Request, res: Response) => {
    if (req.body.email && req.body.password) {
        let email: string = req.body.email;
        let password: string = req.body.password;

        let user = await User.findOne({
            where: { email }
        });

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                res.json({ status: true });
                return;
            }
        }
    }

    res.json({ status: false });
}

export const listAll = async (req: Request, res: Response) => {
    let users = await User.findAll();

    res.json({ users });
}

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ error: 'E-mail não fornecido.' });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Gere uma senha aleatória
        const randomPassword = generateRandomPassword();

        // Criptografe a senha aleatória antes de armazená-la no banco de dados
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Atualize a senha do usuário no banco de dados
        user.password = hashedPassword;
        await user.save();

        // Configuração do transporte de e-mail usando Nodemailer
        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: '3c06f9dbdde467',
                pass: 'b338ed92a62e61',
            },
        });

        // Montando as opções do e-mail
        const mailOptions = {
            from: 'seu-email@dominio.com',
            to: email,
            subject: 'Recuperação de Senha',
            text: `Sua senha foi redefinida com sucesso. Sua nova senha é: ${randomPassword}`, // Enviando a nova senha ao usuário
        };

                // Enviando o e-mail
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Erro ao enviar o e-mail:', error);
                        return res.status(500).json({ error: 'Ocorreu um erro ao enviar o e-mail.' });
                    } else {
                        console.log('E-mail enviado:', info.response);
                        return res.status(200).json({ message: 'Senha redefinida com sucesso. Verifique seu e-mail para a nova senha.' });
                    }
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Ocorreu um erro ao processar a solicitação.' });
            }
        };
        
