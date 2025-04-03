import { masterSettingService } from "../services/masterSetting.service.js";
import response from "../utils/response.js";

export const getAllMasterSettingData = async (req, res, next) => {
  try {
    const data = await masterSettingService.getAllMasterSettingData();
    return response.success(res, { masterSetting: data });
  } catch (error) {
    next(error);
    console.error(error);
  }
};

export const updateMasterSetting = async (req, res, next) => {
  try {
    const id = req.params.masterSettingId;
    const { currentAcademicYearId } = req.body;
    const data = await masterSettingService.updateMasterSettingData(
      parseInt(id),
      {
        currentAcademicYearId,
      }
    );
    return response.success(res, { masterSetting: data });
  } catch (error) {
    next(error);
    console.error(error);
  }
};
