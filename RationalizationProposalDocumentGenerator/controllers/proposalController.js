const dbService = require('../services/dbService'); 
const documentService = require('../services/documentService'); 

const documentsDB = dbService.documentsDB;

module.exports = {
	async index(req, res) {
		const proposals = await documentsDB.documents.findMany({
			select: {
				documentID: true,
				documents_metadates: {
				  	select: {
						proposalName: true,
				  	},
				},
			},
		})

		if(!req.query.id) {
			res.render("mainPage", { 
				proposals: proposals,
				currentForm: 'proposal',
				isEditPage: false
			});
		}
		else {
			const proposal = await documentsDB.documents.findUnique({
				where: {
				  	documentID: parseInt(req.query.id),
				},
				include: {
				  	documents_metadates: true,
				  	document_authors: {
						include: {
					  		authors: true,
						},
				  	},
				  	document_supplements: {
						include: {
						  supplements: {
							include: {
							  images: true,
							},
						  },
						},
					},
				},
			})

			proposal.document_supplements.forEach(supplement => {
				supplement.supplements.images.forEach(image => {
					const base64Image = image.image ? image.image.toString('base64') : null;
					const imgSrc = `data:image/png;base64,${base64Image}`;
					image.image = imgSrc;
				});
			});

			res.render("mainPage", { 
				proposals: proposals,
				proposal: proposal,
				currentForm: 'proposal',
				isEditPage: true
			});
		}
	},

	async addDocument(req, res) {
		try {
			const dbDocumentId =  await dbService.saveDocumentData(req.body, req.files);
			const documentBuffer = documentService.createDocument(req.body, req.files);
			await dbService.saveDocumentToDB(documentBuffer, dbDocumentId, req.body.proposalName);

			res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''%D0%A0%D0%9F_${encodeURIComponent(req.body.proposalName)}.docx`);
			res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
			res.send(documentBuffer);
		} catch (error) {
			console.error('Ошибка при создании DOCX:', error.message)
			res.status(500).send('Ошибка при создании документа. Обратитесь к администратору.')
		}
	},

	async downloadDocument(req, res) {
		const document = await dbService.getDocumentFromDB(parseInt(req.params.id));

		res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''%D0%A0%D0%9F_${encodeURIComponent(document.name)}.docx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.send(document.document_content);
	},

	async deleteDocument(req, res) {
		await dbService.deleteDocumentFromDB(parseInt(req.params.id));
        res.redirect('/proposal');
	},

	async editDocument(req, res) {
		try {
			await dbService.editDocumentData(req.body, req.files, parseInt(req.params.id));
			const documentBuffer = documentService.createDocument(req.body, req.files);
			await dbService.editDocumentInDB(documentBuffer, parseInt(req.params.id), req.body.proposalName);

			res.redirect('/proposal');
		} catch (error) {
			console.error('Ошибка при создании DOCX:', error.message)
			res.status(500).send('Ошибка при создании документа. Обратитесь к администратору.')
		}
	},
}
