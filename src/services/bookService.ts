import { Model } from 'mongoose';
import { IBook } from '../models/book';

export class BookService {
  private bookModel: Model<IBook>;

  constructor(bookModel: Model<IBook>) {
    this.bookModel = bookModel;
  }

  public async addBook(title: string, author: string) {
    const book = new this.bookModel({ title, author });
    return book.save();
  }

  public async getBooks() {
    return this.bookModel.find().sort('-createdAt');
  }

  public async getBookById(id: string) {
    return this.bookModel.findById(id);
  }

  public async updateBook(id: string, title: string, author: string) {
    return this.bookModel.findByIdAndUpdate(id, { title, author }, { new: true });
  }

  public async deleteBook(id: string) {
    return this.bookModel.findByIdAndDelete(id);
  }
}
