import { Request, Response } from 'express';
import { createBookModel } from '../models/book';
import { BookService } from '../services/bookService';
import mongoose from 'mongoose';

interface CustomRequest extends Request {
    dbConnection?: mongoose.Connection;
}

export const addBook = async (req: CustomRequest, res: Response) => {
    const { title, author } = req.body;

    //Validate data
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }

    //Check if tenant database connection is available
    if (!req.dbConnection) {
        return res.status(500).json({ message: 'No tenant database connection' });
    }

    //Initialize book model and service
    const bookModel = createBookModel(req.dbConnection);
    const bookService = new BookService(bookModel);

    try {
        //Add book
        const book = await bookService.addBook(title, author);

        //Return response
        res.status(201).json(book);
        return;
    } catch (error: any) {
        //Return error response
        res.status(500).json({ message: error.message });
        return;
    }
};

export const getBooks = async (req: CustomRequest, res: Response) => {

    //Check if tenant database connection is available
    if (!req.dbConnection) {
        return res.status(500).json({ message: 'No tenant database connection' });
    }

    //Initialize book model and service
    const bookModel = createBookModel(req.dbConnection);
    const bookService = new BookService(bookModel);

    try {
        //Get books
        const books = (await bookService.getBooks());

        //Return response
        res.status(200).json(books);
        return;
    } catch (error: any) {
        //Return error response
        res.status(500).json({ message: error.message });
        return;
    }
};

export const getBookById = async (req: CustomRequest, res: Response) => {
    const { id } = req.params;

    //Check if tenant database connection is available
    if (!req.dbConnection) {
        return res.status(500).json({ message: 'No tenant database connection' });
    }

    //Initialize book model and service
    const bookModel = createBookModel(req.dbConnection);
    const bookService = new BookService(bookModel);

    try {
        //Get book by id
        const book = await bookService.getBookById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        //Return response
        res.status(200).json(book);
        return;
    } catch (error: any) {
        //Return error response
        res.status(500).json({ message: error.message });
        return;
    }
};

export const updateBook = async (req: CustomRequest, res: Response) => {
    const { id } = req.params;
    const { title, author } = req.body;

    //Validate data
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }

    //Check if tenant database connection is available
    if (!req.dbConnection) {
        return res.status(500).json({ message: 'No tenant database connection' });
    }

    //Initialize book model and service
    const bookModel = createBookModel(req.dbConnection);
    const bookService = new BookService(bookModel);

    try {
        //Update book
        const book = await bookService.updateBook(id, title, author);

        //Return response
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        return res.status(200).json(book);
    } catch (error: any) {
        //Return error response
        return res.status(500).json({ message: error.message });

    }
};

export const deleteBook = async (req: CustomRequest, res: Response) => {
    const { id } = req.params;

    //Check if tenant database connection is available
    if (!req.dbConnection) {
        return res.status(500).json({ message: 'No tenant database connection' });
    }

    //Initialize book model and service
    const bookModel = createBookModel(req.dbConnection);
    const bookService = new BookService(bookModel);

    try {

        //Delete book
        const book = await bookService.deleteBook(id);

        //Return response
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
       return res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error: any) {
        //Return error response
        return res.status(500).json({ message: error.message });

    }
};
