let authorCount = 0;

function addAuthor(authors) {
    if(!authors) {
        authors = {
            authorFIO: '',
            shortAuthorFIO: '',
            authorWorkPosition: '',
            authorWorkplace: '',
            percentageContribution: 100,
            authorNumber: '',
            authorYearBirth: '',
            contribution: '',
        }
    }

    let authorId = ++authorCount;
    const authorsContainer = document.getElementById('authors-container');

    const imgHtml = `
    <div id="author${authorId}" class="author">
        <div style="background-color: black; width: 100%; height: 5px">
            <button type="button" id="remove-img-button${authorId}" class="remove-img-button" style="float: right">X</button>
        </div>
        <div style="display: flex; margin-top: 20px">
            <div style="width: 47%">
                <label for="authorNumber">Табельный номер:</label>
                <input type="number" id="author-number" name="authorNumbers[]" min="0" value='${authors.authorNumber}' required><br><br>

                <label for="authorFIO" style="margin-top: 22px">Фамилия, имя, отчество:</label>
                <input type="text" id="author-fio" name="authorFIOs[]" value='${authors.authorFIO}' required><br><br>

                <label for="author-year-birh">Год рождения:</label>
                <input type="number" id="author-year-birh" name="authorYearsBirth[]" min="1900" max="${new Date().getFullYear()}" step="1" value='${authors.authorYearBirth}' required><br><br>

                <label for="authorWorkplace">Место работы:</label>
                <input type="text" id="author-workplace" name="authorWorkplaces[]" value='${authors.authorWorkPosition}' required><br><br>
            </div>

            <div style="width: 50%; margin-left: 3%">
                <label for="author-work-position">Должность:</label>
                <input type="text" id="author-work-position" name="authorWorkPositions[]" value='${authors.authorWorkplace}' required><br><br>

                <label for="contribution">Обоснование конкретного творческого вклада:</label>
                <input type="text" id="contribution" name="contributions[]" value='${authors.contribution}' required><br><br>

                <label for="percent-contribution">% авторского вклада:</label>
                <input type="number" id="percent-contribution" name="percentageContributions[]" min="0" max="100" step="1" value='${authors.percentageContribution}' required><br><br>
            </div>
        </div>
    </div>
    `;

    authorsContainer.insertAdjacentHTML('beforeend', imgHtml);
    document.getElementById(`remove-img-button${authorId}`).addEventListener('click', () => document.getElementById(`author${authorId}`).remove());
}

