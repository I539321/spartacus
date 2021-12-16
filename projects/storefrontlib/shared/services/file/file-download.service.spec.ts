import { TestBed } from '@angular/core/testing';
import { FileDownloadService } from './file-download.service';

const fakeUrl =
  'blob:http://localhost:9877/50d43852-5f76-41e0-bb36-599d4b99af07';
const fileName = 'data.csv';

describe('FileDownloadService', () => {
  let service: FileDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should download the file', () => {
    const link = document.createElement('a');

    jest.spyOn(document, 'createElement').mockReturnValue(link);
    jest.spyOn(link, 'setAttribute');
    jest.spyOn(document.body, 'appendChild');
    jest.spyOn(link, 'click');
    jest.spyOn(document.body, 'removeChild');

    service.download(fakeUrl, fileName);

    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(link.setAttribute).toHaveBeenCalledTimes(2);
    expect(link.setAttribute).toHaveBeenCalledWith('href', fakeUrl);
    expect(link.setAttribute).toHaveBeenCalledWith('download', fileName);
    expect(link.href).toBe(fakeUrl);
    expect(link.target).toBe('');
    expect(link.download).toBe('data.csv');
    expect(document.body.appendChild).toHaveBeenCalledTimes(1);
    expect(document.body.appendChild).toHaveBeenCalledWith(link);
    expect(link.click).toHaveBeenCalledTimes(1);
    expect(link.click).toHaveBeenCalledWith();
    expect(document.body.removeChild).toHaveBeenCalledTimes(1);
    expect(document.body.removeChild).toHaveBeenCalledWith(link);
  });
});
