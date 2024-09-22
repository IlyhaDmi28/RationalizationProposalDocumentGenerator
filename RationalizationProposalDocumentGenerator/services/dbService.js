const formatService = require('./formatService'); 
const fs = require('fs');

const { PrismaClient: PrismaClient1 } = require('../prisma/generated/client1');
const { PrismaClient: PrismaClient2 } = require('../prisma/generated/client2');
const documentsDB = new PrismaClient1();
const documentsMain = new PrismaClient2();

module.exports = {
    documentsDB,
    documentsMain,

    async saveDocumentData(data, files) {
		const supplements = data.supplements === undefined ? [] : formatService.createSupplements(
			data.supplements,
			files
		);
		
		const authors = formatService.createAuthors(
			data.authorNumbers,
			data.authorFIOs,
			data.authorWorkplaces,
			data.authorWorkPositions,
			data.authorYearsBirth,
			data.contributions,
			data.percentageContributions
		);
	
		try {
			const result = await documentsDB.$transaction(async (documentsDB) => {
				industrialSafety = data.industrialSafety ? 'true' : 'false';

				const docMetadata = await documentsDB.documents_metadates.create({
					data: {
						orgName: data.orgName,
						boss: data.boss,
						problemDescription: data.problemDescription,
						solution: data.solution,
						result: data.result,
						proposalName: data.proposalName,
						infoAboutUseObject: data.infoAboutUseObject,
						readinessDegree: data.readinessDegree,
						beneficialEffect: data.beneficialEffect,
						effectDescription: data.effectDescription,
						innovation: data.innovation,
						useful: data.useful,
						expediency: data.expediency,
						tradeSecretRegime: data.tradeSecretRegime,
						workplaceTradeSecret: data.workplaceTradeSecret,
						fioTradeSecret: data.fioTradeSecret,
						industrialSafety: data.industrialSafety ? 'true' : 'false',
						workplaceIndustrialSafety: data.workplaceIndustrialSafety,
						fioIndustrialSafety: data.fioIndustrialSafety,
						environmentalSafety: data.environmentalSafety ? 'true' : 'false',
						workplaceEnvironmentalSafety: data.workplaceEnvironmentalSafety,
						fioEnvironmentalSafety: data.fioEnvironmentalSafety,
					}
				});
	
				const metadataID = docMetadata.metadataID;
	
				const doc = await documentsDB.documents.create({
					data: {
						metadataID: metadataID,
					},
				});
	
				const documentID = doc.documentID;
	
				for (let i = 0; i < authors.length; i++) {
					const author = await documentsDB.authors.create({
						data: {
							authorFIO: authors[i].authorFIO,
							shortAuthorFIO: authors[i].shortAuthorFIO,
							authorYearBirth: parseInt(authors[i].authorYearBirth),
							authorWorkplace: authors[i].authorWorkplace,
							authorWorkPosition: authors[i].authorWorkPosition,
							contribution: authors[i].contribution,
							percentageContribution: parseInt(authors[i].percentageContribution),
							authorNumber: parseInt(authors[i].authorNumber),
						}
					});
	
					await documentsDB.document_authors.create({
						data: {
							documentID: documentID,
							authorID: author.authorID
						}
					});
				}

				for (const supplement of supplements) {
					const supp = await documentsDB.supplements.create({
						data: {
						  	name: supplement.name,
						  	images: {
								create: supplement.images.map(image => ({
							  		image: fs.readFileSync(image.image),
							  		imageName: image.imageName,
								})),
						  	},
						},
						include: {
						  images: true,
						},
					});

					await documentsDB.document_supplements.create({
						data: {
							documentID: documentID,
							supplementID: supp.supplementID
						}
					});
				}
	
				return documentID;
			});
			return result;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async saveDocumentToDB(buffer, dbDocumentId, documentName) {
		try {
			const result = await documentsMain.documents.create({
				data : {
					document_content: buffer,
					db_document_id: dbDocumentId,
					name: documentName
				}
			})

			return result.id
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async editDocumentInDB(buffer, dbDocumentId, documentName) {
		try {
			const result = await documentsMain.documents.updateMany({
				where : {
					db_document_id: dbDocumentId
				},
				data : {
					document_content: buffer,
					name: documentName
				}
			})

			return result.id
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async getDocumentFromDB(id) {
		try {
			const document = await documentsMain.documents.findFirst({
				where : {
					db_document_id: id
				}
			})

			return document
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async editDocumentData(data, files, id) {
		
		const supplements = data.supplements === undefined ? [] : formatService.createSupplements(
			data.supplements,
			files
		);
	
		const authors = formatService.createAuthors(
			data.authorNumbers,
			data.authorFIOs,
			data.authorWorkplaces,
			data.authorWorkPositions,
			data.authorYearsBirth,
			data.contributions,
			data.percentageContributions
		);
	
		try {
			await documentsMain.$transaction(async (documentsMain) => {
				const document = await documentsDB.documents.findUnique({
					where: {
					documentID: id
					}
				});

				if (!document) {
					throw new Error('Document not found');
				}

				const docMetadata = await documentsDB.documents_metadates.update({
					where: {
						metadataID: document.metadataID
					},
						data: {
						orgName: data.orgName,
						boss: data.boss,
						problemDescription: data.problemDescription,
						solution: data.solution,
						result: data.result,
						proposalName: data.proposalName,
						infoAboutUseObject: data.infoAboutUseObject,
						readinessDegree: data.readinessDegree,
						beneficialEffect: data.beneficialEffect,
						effectDescription: data.effectDescription,
						innovation: data.innovation,
						useful: data.useful,
						expediency: data.expediency,
						tradeSecretRegime: data.tradeSecretRegime,
						workplaceTradeSecret: data.workplaceTradeSecret,
						fioTradeSecret: data.fioTradeSecret,
						industrialSafety: data.industrialSafety ? 'true' : 'false',
						workplaceIndustrialSafety: data.workplaceIndustrialSafety,
						fioIndustrialSafety: data.fioIndustrialSafety,
						environmentalSafety: data.environmentalSafety ? 'true' : 'false',
						workplaceEnvironmentalSafety: data.workplaceEnvironmentalSafety,
						fioEnvironmentalSafety: data.fioEnvironmentalSafety,
					}
				});

				const authorsToDelete = await documentsDB.document_authors.findMany({
					where: {
					documentID: id
					},
					select: {
					authorID: true
					}
				});

				await documentsDB.document_authors.deleteMany({
					where: {
					documentID: id
					}
				});

				const deleteAuthorsPromises = authorsToDelete.map(async (author) => {
					await documentsDB.authors.delete({
					where: {
						authorID: author.authorID
					}
					});
				});

				await Promise.all(deleteAuthorsPromises);

				for (const authorData of authors) {
					const newAuthor = await documentsDB.authors.create({
					data: {
						authorFIO: authorData.authorFIO,
						shortAuthorFIO: authorData.shortAuthorFIO,
						authorYearBirth: parseInt(authorData.authorYearBirth),
						authorWorkplace: authorData.authorWorkplace,
						authorWorkPosition: authorData.authorWorkPosition,
						contribution: authorData.contribution,
						percentageContribution: parseInt(authorData.percentageContribution),
						authorNumber: parseInt(authorData.authorNumber),
					}
					});

					await documentsDB.document_authors.create({
					data: {
						documentID: id,
						authorID: newAuthor.authorID
					}
					});
				}

				const supplementsToDelete = await documentsDB.document_supplements.findMany({
					where: {
					documentID: id
					},
					select: {
					supplementID: true
					}
				});

				await documentsDB.document_supplements.deleteMany({
					where: {
					documentID: id
					}
				});

				const deleteSupplementsPromises = supplementsToDelete.map(async (supplement) => {
					await documentsDB.images.deleteMany({
					where: {
						supplementID: supplement.supplementID
					}
					});

					await documentsDB.supplements.delete({
					where: {
						supplementID: supplement.supplementID
					}
					});
				});

				await Promise.all(deleteSupplementsPromises);

				for (const supplement of supplements) {
					const newSupplement = await documentsDB.supplements.create({
					data: {
						name: supplement.name,
						images: {
						create: supplement.images.map(image => ({
							image: fs.readFileSync(image.image),
							imageName: image.imageName,
						})),
						},
					},
					include: {
						images: true,
					},
					});

					await documentsDB.document_supplements.create({
					data: {
						documentID: id,
						supplementID: newSupplement.supplementID
					}
					});
				}
				});
	
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async deleteDocumentFromDB(id) {
		try {
			await documentsMain.documents.deleteMany({
				where : {
					db_document_id: id
				}
			})
			
			await documentsDB.$transaction(async (documentsDB) => {
				await documentsDB.document_authors.deleteMany({
				  where: {
					documentID: id,
				  },
				});
		  
				const documentSupplements = await documentsDB.document_supplements.findMany({
				  	where: {
						documentID: id,
				  	},
				  	include: {
						supplements: {
					  		include: {
								images: true,
					 		 },
						},
				  	},
				});
		  
				for (const documentSupplement of documentSupplements) {
				  	await documentsDB.images.deleteMany({
						where: {
					  		supplementID: documentSupplement.supplementID,
						},
				  	});
				}
		  
				await documentsDB.document_supplements.deleteMany({
					where: {
					  	documentID: id,
					},
				});
				  
				await documentsDB.supplements.deleteMany({
				  	where: {
						supplementID: {
					  		in: documentSupplements.map((ds) => ds.supplementID),
						},
				  	},
				});

				await documentsDB.documents.delete({
					where: {
						documentID: id,
					},
				});
		  
				const documentMetadata = await documentsDB.documents.findUnique({
					where: {
						documentID: id,
					},
					select: {
						metadataID: true,
					},
				});
		  
				if (documentMetadata && documentMetadata.metadataID) {
					await documentsDB.documents_metadates.delete({
						where: {
							metadataID: documentMetadata.metadataID,
						},
					});
				}
			});
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
}